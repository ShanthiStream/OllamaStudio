'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';

export function useTheme() {
  const { theme, accentColor, setTheme, setAccentColor } = useAppStore();
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const update = () => {
      const resolved = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
      setResolvedTheme(resolved);
      root.classList.toggle('dark', resolved === 'dark');
      root.style.setProperty('--accent-color', accentColor);
    };

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [theme, accentColor]);

  const animateTheme = useCallback((newTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    setTheme(newTheme);
    setTimeout(() => root.classList.remove('theme-transitioning'), 350);
  }, [setTheme]);

  return { theme, resolvedTheme, accentColor, setTheme: animateTheme, setAccentColor };
}
