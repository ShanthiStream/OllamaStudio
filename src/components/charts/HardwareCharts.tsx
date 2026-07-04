'use client';

import { motion } from 'framer-motion';
import { Cpu, Monitor, MemoryStick as MemoryIcon, HardDrive, Thermometer, Activity } from 'lucide-react';
import type { HardwareMetrics } from '@/types';
import { CanvasSparkline } from './CanvasSparkline';

interface HardwareChartsProps {
  history: HardwareMetrics[];
}

function extractValues(data: HardwareMetrics[], key: string): number[] {
  return data.map((d) => {
    switch (key) {
      case 'cpu': return d.cpu.usage;
      case 'gpu': return d.gpu.usage;
      case 'ram': return d.memory.usage_percent;
      case 'swap': return d.memory.swap_usage_percent;
      case 'gpu_mem': return (d.gpu.memory_used_mb / d.gpu.memory_total_mb) * 100;
      case 'temp': return d.temperature ?? 0;
      default: return 0;
    }
  });
}

const CHARTS = [
  { key: 'cpu', label: 'CPU', color: '#06b6d4', icon: Cpu, unit: '%' },
  { key: 'gpu', label: 'GPU', color: '#8b5cf6', icon: Monitor, unit: '%' },
  { key: 'ram', label: 'RAM', color: '#f59e0b', icon: MemoryIcon, unit: '%' },
  { key: 'swap', label: 'Swap', color: '#f97316', icon: HardDrive, unit: '%' },
  { key: 'gpu_mem', label: 'GPU Memory', color: '#e11d48', icon: Activity, unit: '%' },
  { key: 'temp', label: 'Temp', color: '#ef4444', icon: Thermometer, unit: '°C' },
];

export function HardwareCharts({ history }: HardwareChartsProps) {
  if (!history || history.length < 2) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CHARTS.map((chart, i) => {
        const values = extractValues(history, chart.key);
        const current = values[values.length - 1];
        const prev = values[0];
        const diff = current - prev;
        const isUp = diff >= 0;

        let displayValue: string;
        if (chart.key === 'temp') {
          displayValue = `${current.toFixed(0)}°C`;
        } else {
          displayValue = `${current.toFixed(1)}${chart.unit}`;
        }

        const isValidTemp = chart.key === 'temp' && current > 0;
        const valMin = isValidTemp ? 30 : 0;
        const valMax = isValidTemp ? 100 : 100;
        const canvasSupported = typeof HTMLCanvasElement !== 'undefined';

        return (
          <motion.div
            key={chart.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-3.5"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <chart.icon className="w-3.5 h-3.5" style={{ color: chart.color }} />
                <span className="text-xs font-medium text-muted-foreground">{chart.label}</span>
              </div>
              <span className="text-sm font-semibold font-mono">{displayValue}</span>
            </div>
            <div className="h-16 -mx-1">
              {canvasSupported ? (
                <CanvasSparkline
                  data={values}
                  color={chart.color}
                  height={64}
                  min={valMin}
                  max={valMax}
                  glowWidth={4}
                  lineWidth={1.5}
                />
              ) : null}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[10px] ${isUp ? 'text-rose-500' : 'text-emerald-500'}`}>
                {isUp ? '+' : ''}{diff.toFixed(1)}
              </span>
              <span className="text-[10px] text-muted-foreground">from start</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
