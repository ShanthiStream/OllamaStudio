'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Search, Brain, HardDrive, Gauge, Star, Trash2, MoreVertical, RefreshCw, Box, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useOllamaModels, useDeleteModel } from '@/hooks/useOllama';
import { useAppStore } from '@/stores/appStore';
import { formatBytes, formatDate, extractModelFamily, formatParameterSize, isCloudModel } from '@/utils/format';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MODEL_FAMILIES, QUANTIZATION_LEVELS } from '@/constants';
import { estimateModelPerformance } from '@/utils/performance';
import { ollamaService } from '@/services/ollama';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });
  const shadowX = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  const shadowY = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const posX = (e.clientX - rect.left) / rect.width - 0.5;
    const posY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(posX);
    y.set(posY);
  }, [x, y, prefersReduced]);

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={prefersReduced ? undefined : handleLeave}
      style={prefersReduced ? {} : {
        rotateX,
        rotateY,
        transformPerspective: 600,
        boxShadow: shadowX,
      }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}

const perfColors = {
  excellent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  great: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  good: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  acceptable: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  heavy: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function ModelsPage() {
  const { data: models, isLoading, refetch } = useOllamaModels();
  const { mutate: deleteModel } = useDeleteModel();
  const { addFavorite, removeFavorite, isFavorite } = useAppStore();
  const [search, setSearch] = useState('');
  const [pullDialogOpen, setPullDialogOpen] = useState(false);
  const [pullModelName, setPullModelName] = useState('');
  const [pulling, setPulling] = useState(false);
  const [pullStatus, setPullStatus] = useState('');
  const [pullProgress, setPullProgress] = useState(0);
  const [pullCompletedBytes, setPullCompletedBytes] = useState(0);
  const [pullTotalBytes, setPullTotalBytes] = useState(0);

  const [filterType, setFilterType] = useState<'all' | 'local' | 'cloud'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'size-asc' | 'size-desc' | 'date-asc' | 'date-desc'>('size-desc');

  const allModels = models || [];
  const localModels = allModels.filter(m => !isCloudModel(m.name));
  const cloudModels = allModels.filter(m => isCloudModel(m.name));

  const filteredByType = allModels.filter(m => {
    if (filterType === 'local') return !isCloudModel(m.name);
    if (filterType === 'cloud') return isCloudModel(m.name);
    return true;
  });

  const filtered = filteredByType.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === 'size-asc') {
      return a.size - b.size;
    }
    if (sortBy === 'size-desc') {
      return b.size - a.size;
    }
    if (sortBy === 'date-asc') {
      const dateA = new Date(a.modified_at || 0).getTime();
      const dateB = new Date(b.modified_at || 0).getTime();
      return dateA - dateB;
    }
    if (sortBy === 'date-desc') {
      const dateA = new Date(a.modified_at || 0).getTime();
      const dateB = new Date(b.modified_at || 0).getTime();
      return dateB - dateA;
    }
    return 0;
  });

  const handleFavorite = (name: string) => {
    if (isFavorite(name)) {
      removeFavorite(name);
      toast.success('Removed from favorites');
    } else {
      addFavorite({ id: name, type: 'model', label: name, added_at: new Date().getTime() });
      toast.success('Added to favorites');
    }
  };

  const handleDelete = (name: string) => {
    deleteModel(name, {
      onSuccess: () => toast.success(`Deleted ${name}`),
      onError: () => toast.error(`Failed to delete ${name}`),
    });
  };

  const handlePullModel = async () => {
    if (!pullModelName.trim()) return;
    setPulling(true);
    setPullStatus('initiating connection');
    setPullProgress(0);
    setPullCompletedBytes(0);
    setPullTotalBytes(0);
    try {
      await ollamaService.pullModel(pullModelName.trim(), (prog) => {
        setPullStatus(prog.status);
        if (prog.percent !== undefined) setPullProgress(prog.percent);
        if (prog.completed !== undefined) setPullCompletedBytes(prog.completed);
        if (prog.total !== undefined) setPullTotalBytes(prog.total);
      });
      toast.success(`Successfully pulled ${pullModelName.trim()}`);
      setPullDialogOpen(false);
      setPullModelName('');
      refetch();
    } catch (err: any) {
      toast.error(`Failed to pull ${pullModelName.trim()}: ${err.message || 'Error occurred'}`);
    } finally {
      setPulling(false);
      setPullStatus('');
      setPullProgress(0);
    }
  };

  return (
    <div>
      <PageHeader
        title="Installed Models"
        description={`${localModels.length} local • ${cloudModels.length} cloud models installed`}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64 h-9 rounded-full bg-accent/50"
          />
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setPullDialogOpen(true); setPullModelName(''); }}>
          <Download className="w-4 h-4 mr-2" />
          Pull Model
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-border/30 pb-3 select-none">
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs"
            onClick={() => setFilterType('all')}
          >
            All Models ({allModels.length})
          </Button>
          <Button
            variant={filterType === 'local' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs"
            onClick={() => setFilterType('local')}
          >
            Local Models ({localModels.length})
          </Button>
          <Button
            variant={filterType === 'cloud' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs"
            onClick={() => setFilterType('cloud')}
          >
            Cloud Models ({cloudModels.length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs h-8 rounded-lg border border-border/80 bg-background px-2.5 outline-none focus:ring-1 focus:ring-accent-color cursor-pointer font-medium"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="size-desc">Size (Largest first)</option>
            <option value="size-asc">Size (Smallest first)</option>
            <option value="date-desc">Modified (Newest first)</option>
            <option value="date-asc">Modified (Oldest first)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Brain className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No models found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {search ? 'Try a different search term' : 'Pull models from Ollama to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {sorted.map((model, i) => {
              const family = extractModelFamily(model.name);
              const familyInfo = MODEL_FAMILIES[family];
              const quant = model.details?.quantization_level?.toLowerCase() || '';
              const quantInfo = QUANTIZATION_LEVELS[quant];
              const perf = estimateModelPerformance(
                model.name,
                model.details?.parameter_size || '7B',
                quant,
                16, 10, true, 0
              );

              return (
                <motion.div
                  key={model.digest}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  layout
                >
                  <TiltCard>
                    <Link href={`/models/${encodeURIComponent(model.name)}`}>
                      <Card className="glass-card rounded-xl p-5 group cursor-pointer h-full border-transparent hover:border-accent-color/20 transition-colors duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-color/20 to-accent-color/5 flex items-center justify-center">
                              <Brain className="w-5 h-5 text-accent-color" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm leading-tight group-hover:text-accent-color transition-colors">
                                {model.name.replace(/:latest$/, '')}
                              </h3>
                              {familyInfo && (
                                <p className="text-xs text-muted-foreground">{familyInfo.name}</p>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity inline-flex shrink-0 items-center justify-center hover:bg-muted hover:text-foreground outline-none" onClick={(e) => e.preventDefault()}>
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleFavorite(model.name)}>
                                <Star className="w-4 h-4 mr-2" />
                                {isFavorite(model.name) ? 'Unfavorite' : 'Favorite'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(model.name)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {model.details?.parameter_size && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                              <Box className="w-3 h-3 mr-1" />
                              {formatParameterSize(model.details.parameter_size)}
                            </Badge>
                          )}
                          {quant && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                              <Gauge className="w-3 h-3 mr-1" />
                              {quant.toUpperCase()}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                            <HardDrive className="w-3 h-3 mr-1" />
                            {formatBytes(model.size)}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={`text-[10px] px-2 py-0.5 border ${perfColors[perf.label]}`}>
                            {perf.label.charAt(0).toUpperCase() + perf.label.slice(1)} Performance
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(model.modified_at)}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      <Dialog open={pullDialogOpen} onOpenChange={(open) => { if (!pulling) setPullDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Pull Model</DialogTitle>
            <DialogDescription>
              Download a model from the Ollama library (e.g., llama3.2, mistral, phi4)
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <Input
              value={pullModelName}
              onChange={(e) => setPullModelName(e.target.value)}
              placeholder="Enter model name (e.g., llama3.2)"
              onKeyDown={(e) => { if (e.key === 'Enter' && !pulling) handlePullModel(); }}
              disabled={pulling}
            />
            {pulling && (
              <div className="space-y-2 select-none animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span className="capitalize">{pullStatus || 'Downloading...'}</span>
                  {pullProgress > 0 && <span>{pullProgress}%</span>}
                </div>
                <div className="w-full bg-accent/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-accent-color h-full rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${pullProgress}%` }}
                  />
                </div>
                {pullTotalBytes > 0 && (
                  <div className="text-[10px] text-muted-foreground/75 font-mono text-right">
                    {(pullCompletedBytes / (1024 * 1024 * 1024)).toFixed(2)} GB / {(pullTotalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPullDialogOpen(false)} disabled={pulling}>Cancel</Button>
            <Button onClick={handlePullModel} disabled={pulling || !pullModelName.trim()}>
              {pulling ? 'Pulling...' : 'Pull'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
