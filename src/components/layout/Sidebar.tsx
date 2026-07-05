'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewTransition } from '@/hooks/useViewTransition';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  LayoutDashboard, Brain, MessageSquare, BarChart3, Play,
  Activity, Zap, Clock, Star, Settings, Info,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'playground', label: 'Playground', icon: Zap, href: '/playground' },
  { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3, href: '/benchmarks' },
  { id: 'running', label: 'Running Models', icon: Play, href: '/running' },
  { id: 'system', label: 'System Monitor', icon: Activity, href: '/system' },
  { id: 'history', label: 'History', icon: Clock, href: '/history' },
  { id: 'favorites', label: 'Favorites', icon: Star, href: '/favorites' },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  { id: 'about', label: 'About', icon: Info, href: '/about' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { navigate } = useViewTransition();
  const prefersReduced = useReducedMotion();

  const handleNav = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 64 }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col glass border-r border-border/50"
      layout
    >
      <div className="flex items-center h-16 px-4 border-b border-border/50">
        <div className={cn("flex items-center gap-2.5 overflow-hidden", !sidebarOpen && "justify-center w-full")}>
          <img src="/ollama-icon.png" alt="Ollama" className="w-8 h-8 object-contain flex-shrink-0 drop-shadow-sm" />
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col leading-tight"
              >
                <span className="font-bold text-base tracking-tight">Ollama</span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Studio</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <a key={item.id} href={item.href} onClick={handleNav(item.href)}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-accent-color/10 text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                {...(prefersReduced ? {} : { whileHover: { x: 3 }, transition: { type: "spring" as const, stiffness: 400, damping: 25 } })}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{
                      background: "var(--accent-color)",
                      boxShadow: "0 0 8px color-mix(in srgb, var(--accent-color) 50%, transparent)",
                    }}
                  />
                )}
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-all duration-200",
                  isActive && "text-accent-color"
                )} />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </a>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/50 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <a key={item.id} href={item.href} onClick={handleNav(item.href)}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-accent-color/10 text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                {...(prefersReduced ? {} : { whileHover: { x: 3 }, transition: { type: "spring" as const, stiffness: 400, damping: 25 } })}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-all duration-200",
                  isActive && "text-accent-color"
                )} />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </a>
          );
        })}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
