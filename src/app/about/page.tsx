'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Globe, ExternalLink, Heart, Zap, Brain, Cpu, Layers, Sparkles, Code, Check } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } }
  };

  const features = [
    {
      title: 'Model Library',
      desc: 'Browse, search, sort, filter, pull, and delete local GGUF models effortlessly.',
      icon: Brain,
      color: 'text-cyan-500 bg-cyan-500/10'
    },
    {
      title: 'Prompt Playground',
      desc: 'Compare multiple models concurrently with live token streaming and side-by-side output evaluation.',
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      title: 'Hardware Monitor',
      desc: 'Live telemetry tracking CPU, GPU, RAM, VRAM, and thermal stats with real-time charting.',
      icon: Cpu,
      color: 'text-rose-500 bg-rose-500/10'
    },
    {
      title: 'Performance Profiling',
      desc: 'Nuanced grade-level estimations to check if models fit total system memory.',
      icon: Layers,
      color: 'text-violet-500 bg-violet-500/10'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="About Ollama Studio"
        description="A premium dashboard for local-first artificial intelligence"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card rounded-2xl p-8 relative overflow-hidden border border-border/40 shadow-xl flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-background/40 to-accent/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-color/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden border border-border/40 bg-background/50 shadow-md p-1.5 shrink-0">
              <img src="/ollama-icon.png" alt="Ollama Studio Logo" className="w-full h-full object-contain" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <h2 className="text-3xl font-extrabold tracking-tight">Ollama Studio</h2>
                  <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold bg-accent-color/10 text-accent-color border border-accent-color/20">v1.0.0</Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                  The ultimate local model orchestration dashboard. Manage local LLMs, analyze device hardware footprints, compare text generation in real-time, and run performance benchmarks completely on-device.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <a
                  href="https://github.com/ShanthiStream/OllamaStudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity shadow-sm select-none"
                >
                  <GithubIcon className="w-4 h-4 animate-pulse" />
                  GitHub Repository
                </a>
                <a
                  href="https://buymeacoffee.com/shanthistream"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#FFDD00] text-black rounded-full hover:bg-[#FFDD00]/90 transition-colors shadow-sm select-none"
                >
                  <Heart className="w-4 h-4 fill-current text-rose-600 animate-pulse" />
                  Support Project
                </a>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Feature & Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Features */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card rounded-2xl p-6 h-full border border-border/40 shadow-md space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-color" />
                Key Features
              </h3>
              <div className="grid grid-cols-1 gap-3.5">
                {features.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div key={feat.title} className="flex gap-3 p-3.5 rounded-xl bg-accent/20 border border-border/20 transition-all hover:bg-accent/30 group">
                      <div className={`p-2 rounded-lg shrink-0 ${feat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground group-hover:text-accent-color transition-colors">{feat.title}</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Creator & Tech Stack */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Creator Card */}
            <Card className="glass-card rounded-2xl p-6 border border-border/40 shadow-md space-y-3.5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Code className="w-4 h-4 text-accent-color" />
                Creator Profile
              </h3>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Dinesh Puthiyedath</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI and Data Engineer focused on building intelligent local-first solutions, machine learning integrations, and open-source data tools.
                </p>
                <div className="pt-2">
                  <a
                    href="https://dinesh-ai.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-accent-color font-semibold hover:underline"
                  >
                    View Portfolio Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </Card>

            {/* Stack Card */}
            <Card className="glass-card rounded-2xl p-6 border border-border/40 shadow-md space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-color" />
                Technology Stack
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {[
                  'Next.js 16',
                  'React 19',
                  'TypeScript',
                  'TailwindCSS v4',
                  'shadcn/ui',
                  'Framer Motion',
                  'ZustandState',
                  'TanStack Query',
                  'Recharts',
                  'Lucide Icons'
                ].map((stack) => (
                  <Badge key={stack} variant="secondary" className="px-2.5 py-1 text-xs font-semibold bg-muted/65 hover:bg-muted transition-colors select-none">
                    <Check className="w-3 h-3 mr-1 text-accent-color" />
                    {stack}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
