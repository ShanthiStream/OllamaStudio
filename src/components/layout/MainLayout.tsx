'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAppStore } from '@/stores/appStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen } = useAppStore();
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
        <div
          className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full opacity-[0.03] dark:opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, var(--accent-color) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-200px] left-[-200px] w-[400px] h-[400px] rounded-full opacity-[0.02] dark:opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, var(--accent-color) 0%, transparent 70%)",
          }}
        />
      </div>
      <Sidebar />
      <Navbar />
      <main
        className={cn(
          "pt-16 min-h-screen",
          sidebarOpen ? "pl-[260px]" : "pl-16"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={mounted && !prefersReduced ? { opacity: 0, y: 8 } : false}
            animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
            exit={prefersReduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="p-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
