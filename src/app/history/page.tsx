'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, MessageSquare, Search, Trash2, Star } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore } from '@/stores/appStore';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/utils/format';

export default function HistoryPage() {
  const { conversations, deleteConversation, addFavorite, removeFavorite, isFavorite } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="History"
        description={`${conversations.length} conversations`}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64 h-9 rounded-full bg-accent/50"
          />
        </div>
      </PageHeader>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Clock className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No conversations yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Start a chat to see it here</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Search className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No results</h3>
          <p className="text-muted-foreground text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card className="glass-card rounded-xl p-4 hover:bg-accent/20 transition-all duration-200 group">
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/playground?id=${conv.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-accent-color transition-colors" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-accent-color transition-colors">{conv.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="bg-muted px-1.5 py-0.2 rounded text-[10px] uppercase font-mono max-w-[200px] truncate">{conv.model.replace(/,/g, ' + ')}</span>
                        <span>{formatRelativeTime(conv.updated_at)}</span>
                        <span>{conv.messages.length} messages</span>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      onClick={() => {
                        if (isFavorite(conv.id)) removeFavorite(conv.id);
                        else addFavorite({ id: conv.id, type: 'chat', label: conv.title, added_at: Date.now() });
                      }}
                    >
                      <Star className={`w-4 h-4 ${isFavorite(conv.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => deleteConversation(conv.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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
