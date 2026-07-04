'use client';

import { useState, useEffect, useRef } from 'react';
import { systemService } from '@/services/system';
import type { HardwareMetrics, SystemInfo } from '@/types';
import { REFRESH_INTERVALS } from '@/constants';

export function useSystemInfo() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      const data = await systemService.getSystemInfo();
      if (mounted) {
        setInfo(data);
        setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  return { systemInfo: info, loading, isAvailable: info !== null };
}

export function useHardwareMetrics(refreshInterval = REFRESH_INTERVALS.HARDWARE) {
  const [metrics, setMetrics] = useState<HardwareMetrics | null>(null);
  const [history, setHistory] = useState<HardwareMetrics[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const fetch = async () => {
      const data = await systemService.getHardwareMetrics();
      if (data) {
        setMetrics(data);
        setHistory(prev => {
          const next = [...prev, data].slice(-120);
          return next;
        });
      }
    };

    fetch();
    intervalRef.current = setInterval(fetch, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshInterval]);

  return { metrics, history, isAvailable: metrics !== null };
}
