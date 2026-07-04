'use client';

import { Search, Moon, Sun, RotateCw, Bell, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { useOllamaStatus } from '@/hooks/useOllama';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CommandPalette } from '@/components/search/CommandPalette';

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: status, refetch: refetchStatus } = useOllamaStatus();
  const { notifications, sidebarOpen } = useAppStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <CommandPalette />
      <header
        className={cn(
          "fixed top-0 right-0 h-16 glass border-b border-border/50 z-30 flex items-center justify-between px-6 transition-all duration-200",
          sidebarOpen ? "left-[260px]" : "left-16"
        )}
      >
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search models, chats, settings..."
              className="pl-9 h-9 bg-accent/50 border-none rounded-full text-sm cursor-pointer"
              onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
              onFocus={(e) => { e.target.blur(); document.dispatchEvent(new CustomEvent('open-command-palette')); }}
              readOnly
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50">
          <motion.div
            animate={{ scale: status?.running ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="relative"
          >
            <div className={cn("w-2 h-2 rounded-full", status?.running ? "bg-emerald-500" : "bg-red-500")} />
            {status?.running && (
              <div
                className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-30 bg-emerald-500"
              />
            )}
          </motion.div>
          <span className="text-xs text-muted-foreground">
            {status?.running ? `v${status.version}` : 'Offline'}
          </span>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => refetchStatus()}>
          <RotateCw className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full relative inline-flex shrink-0 items-center justify-center size-8 hover:bg-muted hover:text-foreground transition-all outline-none">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 text-sm font-medium">Notifications</div>
            {notifications.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm">No notifications</div>
            )}
            {notifications.slice(0, 5).map((n) => (
              <DropdownMenuItem key={n.id} className="p-3">
                <div>
                  <div className="text-sm">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.message}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </header>
    </>
  );
}
