'use client';

import { motion } from 'framer-motion';
import {
  Brain, Cpu, HardDrive, Activity, Gauge,
  Server, Thermometer, CpuIcon,
  MemoryStick as MemoryIcon, Monitor, Box
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { useOllamaModels, useOllamaStatus, useOllamaRunningModels } from '@/hooks/useOllama';
import { useHardwareMetrics, useSystemInfo } from '@/hooks/useHardwareMonitor';
import { formatBytes, isCloudModel } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { HardwareCharts } from '@/components/charts/HardwareCharts';

interface LiveMetricCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

function LiveMetricCard({ label, value, icon: Icon, color = 'text-primary' }: LiveMetricCardProps) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg bg-primary/5 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-semibold mt-0.5 font-mono">{value}</p>
      </div>
    </div>
  );
}



export default function Dashboard() {
  const { data: models, isLoading: modelsLoading } = useOllamaModels();
  const { data: status, isLoading: statusLoading } = useOllamaStatus();
  const { data: runningModels } = useOllamaRunningModels();
  const { metrics, history, isAvailable: metricsAvailable } = useHardwareMetrics();
  const { systemInfo, loading: sysLoading } = useSystemInfo();

  const allModels = models || [];
  const localModels = allModels.filter(m => !isCloudModel(m.name));
  const cloudModels = allModels.filter(m => isCloudModel(m.name));
  const totalSize = localModels.reduce((sum, m) => sum + m.size, 0);
  const sortedBySize = [...localModels].sort((a, b) => b.size - a.size);
  const largestModel = sortedBySize[0];
  const avgSize = localModels.length ? totalSize / localModels.length : 0;

  const heroCards = [
    { title: 'Installed Models', value: allModels.length, icon: Brain, subtitle: `${localModels.length} Local • ${cloudModels.length} Cloud` },
    { title: 'Running Models', value: runningModels?.length || 0, icon: Activity, subtitle: 'Active now' },
    { title: 'Largest Model', value: largestModel ? largestModel.name.split(':')[0] : '-', icon: Box, subtitle: largestModel ? formatBytes(largestModel.size) : '' },
    { title: 'Total Storage', value: formatBytes(totalSize), icon: HardDrive, subtitle: 'All models' },
    { title: 'Avg Model Size', value: avgSize ? formatBytes(avgSize) : '-', icon: Gauge, subtitle: 'Per model' },
    { title: 'Ollama Version', value: status?.version || '-', icon: Server, subtitle: status?.running ? 'Running' : 'Stopped' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your local AI environment at a glance"
      >
        <Button variant="outline" size="sm" className="rounded-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {heroCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Live Hardware Monitor
            {metrics && (
              <span className="ml-2 text-[10px] text-emerald-500">● LIVE</span>
            )}
          </h2>
          {!metricsAvailable ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">System monitoring requires the backend server to be running.</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Run: node server/index.js</p>
            </div>
          ) : metrics ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <LiveMetricCard label="CPU Usage" value={`${metrics.cpu.usage.toFixed(1)}%`} icon={Cpu} color="text-cyan-500" />
                <LiveMetricCard label="GPU Usage" value={`${metrics.gpu.usage.toFixed(1)}%`} icon={Monitor} color="text-violet-500" />
                <LiveMetricCard label="RAM" value={`${metrics.memory.usage_percent.toFixed(1)}%`} icon={MemoryIcon} color="text-amber-500" />
                <LiveMetricCard label="GPU Memory" value={`${(metrics.gpu.memory_used_mb / 1024).toFixed(1)}/${(metrics.gpu.memory_total_mb / 1024).toFixed(1)} GB`} icon={CpuIcon} color="text-rose-500" />
                <LiveMetricCard label="Swap" value={`${metrics.memory.swap_usage_percent.toFixed(1)}%`} icon={HardDrive} color="text-orange-500" />
                <LiveMetricCard label="Temperature" value={metrics.temperature ? `${metrics.temperature.toFixed(0)}°C` : 'N/A'} icon={Thermometer} color="text-red-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Trends (last 2 min)</h3>
                <HardwareCharts history={history} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">System Info</h2>
          {sysLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : systemInfo ? (
            <div className="glass-card rounded-xl divide-y divide-border/50">
              {[
                { label: 'Hostname', value: systemInfo.hostname },
                { label: 'Platform', value: `${systemInfo.platform} ${systemInfo.arch}` },
                { label: 'OS', value: systemInfo.os },
                { label: 'CPU', value: `${systemInfo.cpu.model} (${systemInfo.cpu.cores} cores)` },
                { label: 'GPU', value: systemInfo.gpu.model || 'Not detected' },
                { label: 'RAM', value: `${systemInfo.memory.total_gb.toFixed(1)} GB` },
                { label: 'Disk', value: `${systemInfo.disk.usage_percent.toFixed(1)}% used` },
                { label: 'Apple Silicon', value: systemInfo.cpu.is_apple_silicon ? 'Yes' : 'No' },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <Server className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">System information requires the backend server</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
