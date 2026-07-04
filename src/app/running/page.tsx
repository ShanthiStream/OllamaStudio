'use client';

import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { Play, StopCircle, RefreshCw, Cpu, HardDrive, MemoryStick as MemoryIcon, Clock, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useOllamaRunningModels } from '@/hooks/useOllama';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBytes, formatRelativeTime, formatDuration, isCloudModel } from '@/utils/format';
import { toast } from 'sonner';

export default function RunningModelsPage() {
  const { data: models, isLoading, refetch } = useOllamaRunningModels();
  const localModels = (models || []).filter(m => !isCloudModel(m.name));

  const unloadModel = useCallback(async (modelName: string) => {
    try {
      await fetch('/ollama-api/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName, prompt: '', keep_alive: '0s', stream: false }),
      });
      toast.success(`Unloaded ${modelName}`);
      refetch();
    } catch {
      toast.error(`Failed to unload ${modelName}`);
    }
  }, [refetch]);

  return (
    <div>
      <PageHeader
        title="Running Models"
        description={`${localModels.length} models currently loaded in memory`}
      >
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : localModels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Play className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No running models</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Start a chat or generate text to load a model into memory
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {localModels.map((model, i) => (
            <motion.div
              key={model.digest}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <h3 className="font-semibold">{model.name.replace(/:latest$/, '')}</h3>
                      <p className="text-xs text-muted-foreground">Loaded in memory</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="rounded-full text-xs h-8" onClick={() => unloadModel(model.name)}>
                      <StopCircle className="w-3 h-3 mr-1" />
                      Unload
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full text-xs h-8 text-destructive" onClick={() => unloadModel(model.name)}>
                      <XCircle className="w-3 h-3 mr-1" />
                      Force Unload
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-lg p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <MemoryIcon className="w-3 h-3" /> Memory
                    </div>
                    <p className="text-sm font-medium">{formatBytes(model.size)}</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Cpu className="w-3 h-3" /> VRAM
                    </div>
                    <p className="text-sm font-medium">{model.size_vram ? formatBytes(model.size_vram) : 'N/A'}</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Clock className="w-3 h-3" /> Expires
                    </div>
                    <p className="text-sm font-medium">{model.expires_at ? formatRelativeTime(new Date(model.expires_at).getTime()) : 'Never'}</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <HardDrive className="w-3 h-3" /> Size on Disk
                    </div>
                    <p className="text-sm font-medium">{formatBytes(model.size)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
