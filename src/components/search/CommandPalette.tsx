'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain, MessageSquare, BarChart3, Play, Activity,
  Zap, Clock, Star, Settings, Info, Hash, Cpu, ExternalLink
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { useOllamaModels } from '@/hooks/useOllama';
import { useViewTransition } from '@/hooks/useViewTransition';
import { NAV_ITEMS } from '@/constants';
import { isCloudModel } from '@/utils/format';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard: ({ className }: { className?: string }) => <Hash className={className} />,
  Brain, MessageSquare, BarChart3, Play, Activity,
  Zap, Clock, Star, Settings, Info,
};

const quickActions = [
  { id: 'new-chat', label: 'Start a chat', icon: MessageSquare, href: '/chat' },
  { id: 'benchmarks', label: 'Run benchmark', icon: BarChart3, href: '/benchmarks' },
  { id: 'settings', label: 'Open settings', icon: Settings, href: '/settings' },
  { id: 'playground', label: 'Open playground', icon: Zap, href: '/playground' },
];

export function CommandPalette() {
  const router = useRouter();
  const { navigate } = useViewTransition();
  const [open, setOpen] = useState(false);
  const { data: models } = useOllamaModels();
  const localModels = (models || []).filter(m => !isCloudModel(m.name));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const handleOpen = () => {
      setTimeout(() => {
        setOpen(true);
      }, 100);
    };
    document.addEventListener('keydown', down);
    document.addEventListener('open-command-palette', handleOpen);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('open-command-palette', handleOpen);
    };
  }, []);

  const runAction = useCallback((href: string) => {
    setOpen(false);
    navigate(href);
  }, [navigate]);

  const modelAction = useCallback((name: string, action: 'chat' | 'info') => {
    setOpen(false);
    if (action === 'chat') {
      navigate(`/chat?model=${encodeURIComponent(name)}`);
    } else {
      navigate(`/models/${encodeURIComponent(name)}`);
    }
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, models, or run commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {localModels.length > 0 && (
          <CommandGroup heading={`Models (${localModels.length})`}>
            {localModels.slice(0, 8).map((m) => {
              const modelName = m.name.split(':')[0];
              const tag = m.name.split(':')[1] || 'latest';
              return (
                <CommandItem
                  key={m.name}
                  onSelect={() => modelAction(m.name, 'info')}
                >
                  <Brain className="opacity-70" />
                  <span className="flex-1">{modelName}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{tag}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">Details</span>
                </CommandItem>
              );
            })}
            {localModels.length > 8 && (
              <CommandItem onSelect={() => runAction('/models')}>
                <ExternalLink className="opacity-70" />
                <span className="text-muted-foreground">View all {localModels.length} models</span>
              </CommandItem>
            )}
          </CommandGroup>
        )}

        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.id}
                onSelect={() => runAction(action.href)}
              >
                <Icon className="opacity-70" />
                <span>{action.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || Hash;
            return (
              <CommandItem
                key={item.id}
                onSelect={() => runAction(item.href)}
              >
                <Icon className="opacity-70" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
      <div className="border-t border-border/50 p-2 px-3 flex items-center gap-4 text-[10px] text-muted-foreground">
        <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono">↑↓</kbd> Navigate</span>
        <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono">↵</kbd> Open</span>
        <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono">esc</kbd> Close</span>
      </div>
    </CommandDialog>
  );
}
