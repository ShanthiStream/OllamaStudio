'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Gauge, Zap } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ChatStreamVisualizerProps {
  isStreaming: boolean;
  onToken?: () => void;
  tokensPerSecond?: number;
  firstTokenLatency?: number;
  totalTokens?: number;
  compact?: boolean;
}

export function ChatStreamVisualizer({
  isStreaming,
  onToken,
  tokensPerSecond: tps,
  firstTokenLatency,
  totalTokens,
  compact = false,
}: ChatStreamVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [instantTps, setInstantTps] = useState(0);
  const tokenTimesRef = useRef<number[]>([]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!isStreaming) {
      setInstantTps(0);
      tokenTimesRef.current = [];
      return;
    }
  }, [isStreaming]);

  useEffect(() => {
    if (onToken) {
      const now = performance.now();
      tokenTimesRef.current.push(now);
      const windowStart = now - 2000;
      tokenTimesRef.current = tokenTimesRef.current.filter(t => t > windowStart);
      if (tokenTimesRef.current.length > 1) {
        const tps = (tokenTimesRef.current.length - 1) / 2;
        setInstantTps(Math.round(tps * 10) / 10);
      }
    }
  }, [onToken]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const time = performance.now() / 1000;

    ctx.clearRect(0, 0, w, h);

    const midY = h / 2;
    const amp = isStreaming ? h * 0.35 : 0;
    const freq = 0.02;
    const speed = isStreaming ? 3 + (instantTps / 20) * 5 : 0;

    ctx.strokeStyle = isStreaming ? 'rgba(96, 165, 250, 0.6)' : 'rgba(96, 165, 250, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let pass = 0; pass < 3; pass++) {
      ctx.beginPath();
      const alpha = isStreaming ? 0.6 - pass * 0.15 : 0.1;
      ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;

      for (let x = 0; x < w; x++) {
        const t = x / w;
        const envelope = Math.sin(t * Math.PI);
        const y = midY + Math.sin(x * freq + time * speed) * amp * envelope
                     + Math.sin(x * freq * 2.3 + time * speed * 1.4) * amp * 0.3 * envelope
                     + Math.sin(x * freq * 0.7 + time * speed * 0.6) * amp * 0.2 * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    animRef.current = requestAnimationFrame(draw);
  }, [isStreaming, instantTps]);

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const displayTps = tps || instantTps;

  return (
    <motion.div
      initial={false}
      animate={{
        height: isStreaming ? (compact ? 32 : 48) : 0,
        opacity: isStreaming ? 1 : 0,
      }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            width={compact ? 120 : 200}
            height={compact ? 28 : 40}
            className={`w-full h-full rounded ${compact ? 'h-7' : 'h-10'}`}
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
          {displayTps > 0 && (
            <span className="flex items-center gap-1 font-mono">
              <Zap className="w-3 h-3 text-amber-500" />
              {displayTps} t/s
            </span>
          )}
          {firstTokenLatency !== undefined && firstTokenLatency > 0 && (
            <span className="flex items-center gap-1 font-mono">
              <Gauge className="w-3 h-3 text-cyan-500" />
              {firstTokenLatency}ms
            </span>
          )}
          {totalTokens !== undefined && totalTokens > 0 && (
            <span className="font-mono">{totalTokens} tok</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
