'use client';

import { motion } from 'framer-motion';
import { Activity, Cpu, Monitor, HardDrive, MemoryStick as MemoryIcon, Thermometer, Wifi, Battery, RefreshCw, Gauge } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useHardwareMetrics, useSystemInfo } from '@/hooks/useHardwareMonitor';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function SystemPage() {
  const { metrics, isAvailable: metricsAvailable } = useHardwareMetrics();
  const { systemInfo, loading: sysLoading } = useSystemInfo();

  return (
    <div>
      <PageHeader
        title="System Monitor"
        description="Real-time hardware performance metrics"
      >
        {metricsAvailable && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Live</span>
          </div>
        )}
      </PageHeader>

      {!metricsAvailable ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Activity className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">System monitoring unavailable</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Start the backend server: node server/index.js
          </p>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'CPU', value: `${metrics.cpu.usage.toFixed(1)}%`, icon: Cpu, pct: metrics.cpu.usage, color: 'bg-cyan-500' },
              { label: 'GPU', value: `${metrics.gpu.usage.toFixed(1)}%`, icon: Monitor, pct: metrics.gpu.usage, color: 'bg-violet-500' },
              { label: 'RAM', value: `${metrics.memory.usage_percent.toFixed(1)}%`, icon: MemoryIcon, pct: metrics.memory.usage_percent, color: 'bg-amber-500' },
              { label: 'Swap', value: `${metrics.memory.swap_usage_percent.toFixed(1)}%`, icon: HardDrive, pct: metrics.memory.swap_usage_percent, color: 'bg-orange-500' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-lg font-bold font-mono">{item.value}</span>
                  </div>
                  <Progress value={item.pct} className={`h-2 ${item.color}`} />
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-medium mb-4">Memory Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DetailItem label="Total RAM" value={`${metrics.memory.total_gb.toFixed(1)} GB`} />
              <DetailItem label="Used RAM" value={`${metrics.memory.used_gb.toFixed(1)} GB`} />
              <DetailItem label="Available" value={`${metrics.memory.available_gb.toFixed(1)} GB`} />
              <DetailItem label="Swap Total" value={`${metrics.memory.swap_total_gb.toFixed(1)} GB`} />
              <DetailItem label="Swap Used" value={`${metrics.memory.swap_used_gb.toFixed(1)} GB`} />
              <DetailItem label="GPU Memory" value={`${(metrics.gpu.memory_used_mb / 1024).toFixed(1)} GB`} />
              <DetailItem label="GPU Total" value={`${(metrics.gpu.memory_total_mb / 1024).toFixed(1)} GB`} />
              <DetailItem label="Temperature" value={metrics.temperature ? `${metrics.temperature.toFixed(0)}°C` : 'N/A'} />
            </div>
          </Card>

          <Card className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-medium mb-4">System Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DetailItem label="CPU Model" value={metrics.cpu.model} />
              <DetailItem label="CPU Cores" value={`${metrics.cpu.cores} (${metrics.cpu.physical_cores} physical)`} />
              <DetailItem label="GPU Model" value={metrics.gpu.model || 'N/A'} />
              <DetailItem label="Apple Silicon" value={metrics.cpu.is_apple_silicon ? 'Yes' : 'No'} />
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}
