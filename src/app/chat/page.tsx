'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/playground');
  }, [router]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-accent-color border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground">Redirecting to Playground...</p>
      </div>
    </div>
  );
}
