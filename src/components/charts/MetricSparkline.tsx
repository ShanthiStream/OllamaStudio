'use client';

import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from 'recharts';

interface DataPoint {
  value: number;
}

interface MetricSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
}

export function MetricSparkline({
  data,
  color = '#3b82f6',
  height = 80,
  showTooltip = false,
}: MetricSparklineProps) {
  if (!data || data.length < 2) return null;

  const chartData: DataPoint[] = data.map((v) => ({ value: Math.round(v * 10) / 10 }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {showTooltip && (
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(v: any) => [`${v}%`, 'Usage']}
          />
        )}
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#gradient-${color.replace('#', '')})`}
          dot={false}
          activeDot={{ r: 3, fill: color }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
