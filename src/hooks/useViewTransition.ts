'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useViewTransition() {
  const router = useRouter();

  const navigate = useCallback((href: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        router.push(href);
      });
    } else {
      router.push(href);
    }
  }, [router]);

  return { navigate };
}
