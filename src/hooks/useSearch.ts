'use client';

import { useState, useMemo } from 'react';
import { useOllamaModels } from './useOllama';
import { useAppStore } from '@/stores/appStore';

export interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  type: 'model' | 'chat' | 'benchmark' | 'template' | 'navigation';
  tags?: string[];
  href?: string;
}

interface UseSearchOptions {
  includeModels?: boolean;
  includeConversations?: boolean;
  includeTemplates?: boolean;
  includeFavorites?: boolean;
  includeNavigation?: boolean;
}

export function useSearch(options: UseSearchOptions = {}) {
  const {
    includeModels = true,
    includeConversations = true,
    includeTemplates = true,
    includeFavorites = true,
    includeNavigation = true,
  } = options;

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: models } = useOllamaModels();
  const { conversations, templates, favorites } = useAppStore();

  const search = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: SearchableItem[] = [];

    if (includeModels && models) {
      for (const m of models) {
        if (m.name.toLowerCase().includes(q) || m.details?.family?.toLowerCase().includes(q)) {
          results.push({
            id: m.digest,
            title: m.name,
            description: `${m.details?.parameter_size || '?'} params · ${m.details?.quantization_level || '?'}`,
            type: 'model',
            tags: [m.details?.family || ''],
            href: `/models/${encodeURIComponent(m.name)}`,
          });
        }
      }
    }

    if (includeConversations) {
      for (const c of conversations) {
        if (c.title.toLowerCase().includes(q)) {
          results.push({
            id: c.id,
            title: c.title,
            description: `${c.model} · ${c.messages.length} messages`,
            type: 'chat',
            href: '/history',
          });
        }
      }
    }

    if (includeTemplates) {
      for (const t of templates) {
        if (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q)
        ) {
          results.push({
            id: t.id,
            title: t.name,
            description: t.description,
            type: 'template',
            tags: t.tags,
            href: '/templates',
          });
        }
      }
    }

    if (includeFavorites) {
      for (const f of favorites) {
        if (f.label.toLowerCase().includes(q)) {
          results.push({
            id: f.id,
            title: f.label,
            description: f.description,
            type: f.type as SearchableItem['type'],
            href: `/${f.type === 'chat' ? 'history' : f.type === 'benchmark' ? 'benchmarks' : f.type === 'model' ? 'models' : 'templates'}`,
          });
        }
      }
    }

    if (includeNavigation) {
      const navItems = [
        { id: 'nav-dashboard', title: 'Dashboard', type: 'navigation' as const, href: '/' },
        { id: 'nav-models', title: 'Models', type: 'navigation' as const, href: '/models' },
        { id: 'nav-chat', title: 'Chat Arena', type: 'navigation' as const, href: '/chat' },
        { id: 'nav-benchmarks', title: 'Benchmarks', type: 'navigation' as const, href: '/benchmarks' },
        { id: 'nav-running', title: 'Running Models', type: 'navigation' as const, href: '/running' },
        { id: 'nav-system', title: 'System Monitor', type: 'navigation' as const, href: '/system' },
        { id: 'nav-templates', title: 'Templates', type: 'navigation' as const, href: '/templates' },
        { id: 'nav-playground', title: 'Playground', type: 'navigation' as const, href: '/playground' },
        { id: 'nav-history', title: 'History', type: 'navigation' as const, href: '/history' },
        { id: 'nav-favorites', title: 'Favorites', type: 'navigation' as const, href: '/favorites' },
        { id: 'nav-settings', title: 'Settings', type: 'navigation' as const, href: '/settings' },
      ];
      for (const item of navItems) {
        if (item.title.toLowerCase().includes(q)) {
          results.push(item);
        }
      }
    }

    return results.slice(0, 20);
  }, [query, models, conversations, templates, favorites, includeModels, includeConversations, includeTemplates, includeFavorites, includeNavigation]);

  return { query, setQuery, isOpen, setIsOpen, search };
}
