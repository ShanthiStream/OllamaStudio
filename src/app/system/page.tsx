'use client';

import { motion } from 'framer-motion';
import { Activity, Cpu, Monitor, HardDrive, MemoryStick as MemoryIcon, Thermometer, Server } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useHardwareMetrics, useSystemInfo } from '@/hooks/useHardwareMonitor';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { HardwareCharts } from '@/components/charts/HardwareCharts';

export default function SystemPage() {
  const { metrics, history, isAvailable: metricsAvailable } = useHardwareMetrics();
  const { systemInfo, loading: sysLoading } = useSystemInfo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Monitor"
        description="Real-time hardware performance metrics"
      >
        {metricsAvailable && metrics && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-500 font-semibold font-mono">LIVE</span>
          </div>
        )}
      </PageHeader>

      {!metricsAvailable ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Activity className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">System monitoring unavailable</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Start the backend server: <code>node server/index.js</code>
          </p>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* Progress Cards */}
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

          {/* Performance Trends Chart */}
          <Card className="glass-card rounded-xl p-5">
            <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Performance Trends (last 2 min)</h3>
            <HardwareCharts history={history} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Memory details */}
            <Card className="glass-card rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Memory Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Total RAM" value={`${metrics.memory.total_gb.toFixed(1)} GB`} />
                  <DetailItem label="Used RAM" value={`${metrics.memory.used_gb.toFixed(1)} GB`} />
                  <DetailItem label="Available RAM" value={`${metrics.memory.available_gb.toFixed(1)} GB`} />
                  <DetailItem label="Swap Total" value={`${metrics.memory.swap_total_gb.toFixed(1)} GB`} />
                  <DetailItem label="Swap Used" value={`${metrics.memory.swap_used_gb.toFixed(1)} GB`} />
                  <DetailItem label="GPU Memory Used" value={`${metrics.gpu.memory_used_mb.toFixed(0)} MB`} />
                  <DetailItem label="GPU Memory Total" value={`${metrics.gpu.memory_total_mb.toFixed(0)} MB`} />
                  <DetailItem label="System Temperature" value={metrics.temperature ? `${metrics.temperature.toFixed(0)}°C` : 'N/A'} />
                </div>
              </div>
            </Card>

            {/* System Info */}
            <Card className="glass-card rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">System Info</h3>
              {sysLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              ) : systemInfo ? (
                <div className="divide-y divide-border/50">
                  {[
                    { label: 'Hostname', value: systemInfo.hostname },
                    { label: 'Platform / Architecture', value: `${systemInfo.platform} (${systemInfo.arch})` },
                    { label: 'Operating System', value: systemInfo.os },
                    { label: 'CPU Model', value: `${systemInfo.cpu.model} (${systemInfo.cpu.cores} cores)` },
                    { label: 'GPU Model', value: systemInfo.gpu.model || 'Not detected' },
                    { label: 'Apple Silicon', value: systemInfo.cpu.is_apple_silicon ? 'Yes' : 'No' },
                    { label: 'Total RAM', value: `${systemInfo.memory.total_gb.toFixed(1)} GB` },
                    { label: 'Disk Space', value: `${systemInfo.disk.usage_percent.toFixed(1)}% used` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Server className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">System specs unavailable</p>
                </div>
              )}
            </Card>
          </div>
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
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
