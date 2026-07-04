'use client';

import { motion } from 'framer-motion';
import { Star, Trash2, MessageSquare, Brain, BarChart3, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore } from '@/stores/appStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/utils/format';

const typeIcons = {
  model: Brain,
  chat: MessageSquare,
  benchmark: BarChart3,
  template: FileText,
};

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useAppStore();

  const grouped = {
    model: favorites.filter(f => f.type === 'model'),
    chat: favorites.filter(f => f.type === 'chat'),
    benchmark: favorites.filter(f => f.type === 'benchmark'),
    template: favorites.filter(f => f.type === 'template'),
  };

  return (
    <div>
      <PageHeader
        title="Favorites"
        description={`${favorites.length} saved items`}
      />

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Star className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No favorites yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Star models, chats, and benchmarks to find them quickly
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.entries(grouped) as [string, typeof favorites][]).map(([type, items]) =>
            items.length > 0 && (
              <div key={type}>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </h3>
                <div className="space-y-2">
                  {items.map((item, i) => {
                    const Icon = typeIcons[item.type as keyof typeof typeIcons];
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Card className="glass-card rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{item.label}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => removeFavorite(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
