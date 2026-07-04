'use client';

import { Bot, Globe, ExternalLink, Heart, Zap } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="About" description="Ollama Studio - Premium Local AI Dashboard" />

      <div className="space-y-6">
        <Card className="glass-card rounded-xl p-8 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden border border-border/40 bg-accent/30 shadow-sm p-1">
            <img src="/ollama-icon.png" alt="Ollama Studio Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ollama Studio</h2>
          <p className="text-muted-foreground mb-1 select-none">
            The ultimate local AI model management dashboard
          </p>
          <p className="text-xs text-muted-foreground mb-4 select-none">
            Created by{' '}
            <a
              href="https://dinesh-ai.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-color hover:underline inline-flex items-center gap-0.5"
            >
              Dinesh Puthiyedath
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Badge variant="secondary" className="px-4 py-1 text-sm">v1.0.0</Badge>
            <a
              href="https://buymeacoffee.com/shanthistream"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1 text-xs font-semibold bg-[#FFDD00] text-black rounded-full hover:bg-[#FFDD00]/90 transition-colors shadow-sm select-none h-7"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-rose-600" />
              Buy me a coffee
            </a>
          </div>
        </Card>

        <Card className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Features
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Model Management', 'Multi-model Playground', 'Benchmarks',
              'System Monitor', 'Prompt Templates', 'Hardware Metrics',
              'Performance Analysis', 'Dark/Light Mode', 'Live Graphs',
              'Model Comparison', 'Favorites', 'Search',
            ].map((f, i) => (
              <div key={f} className="glass rounded-lg p-3 text-sm">{f}</div>
            ))}
          </div>
        </Card>

        <Card className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'shadcn/ui', 'Framer Motion', 'Zustand', 'TanStack Query', 'Recharts', 'Lucide Icons'].map((t, i) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
