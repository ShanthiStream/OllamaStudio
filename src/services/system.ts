import axios from 'axios';
import type { SystemInfo, HardwareMetrics } from '@/types';

const SYSTEM_API = process.env.NEXT_PUBLIC_SYSTEM_API_URL || '';

const systemApi = axios.create({
  baseURL: SYSTEM_API,
  timeout: 5000,
});

export const systemService = {
  async getSystemInfo(): Promise<SystemInfo | null> {
    try {
      const { data } = await systemApi.get('/api/system/info');
      return data;
    } catch {
      return null;
    }
  },

  async getHardwareMetrics(): Promise<HardwareMetrics | null> {
    try {
      const { data } = await systemApi.get('/api/system/metrics');
      return data;
    } catch {
      return null;
    }
  },

  async getMetricsHistory(): Promise<HardwareMetrics[]> {
    try {
      const { data } = await systemApi.get('/api/system/metrics/history');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
