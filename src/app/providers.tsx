'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <ErrorBoundary>{children}</ErrorBoundary>
      </MainLayout>
    </QueryClientProvider>
  );
}
