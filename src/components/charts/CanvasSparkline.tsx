'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CanvasSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  min?: number;
  max?: number;
  gradient?: boolean;
  glowWidth?: number;
  lineWidth?: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function CanvasSparkline({
  data,
  color = '#3b82f6',
  height = 64,
  width: propWidth,
  min = 0,
  max = 100,
  gradient = true,
  glowWidth = 6,
  lineWidth = 2,
}: CanvasSparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const prefersReduced = useReducedMotion();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2 || prefersReduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const w = propWidth || rect.width;
    const h = height;
    canvas.width = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    const padding = 4;
    const drawW = w - padding * 2;
    const drawH = h - padding * 2;
    const range = max - min || 1;

    const points = data.map((v, i) => ({
      x: padding + (i / (data.length - 1)) * drawW,
      y: padding + drawH - ((v - min) / range) * drawH,
    }));

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    if (points.length > 1) {
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
    }

    const lineGradient = ctx.createLinearGradient(0, 0, w, 0);
    lineGradient.addColorStop(0, hexToRgba(color, 0.3));
    lineGradient.addColorStop(0.7, color);
    lineGradient.addColorStop(1, color);

    if (glowWidth > 0) {
      ctx.save();
      ctx.shadowBlur = glowWidth;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    if (gradient) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, hexToRgba(color, 0.15));
      grad.addColorStop(1, hexToRgba(color, 0.01));
      ctx.lineTo(points[points.length - 1].x, h);
      ctx.lineTo(points[0].x, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    const lastVal = data[data.length - 1];
    ctx.fillStyle = color;
    const dotX = points[points.length - 1].x;
    const dotY = points[points.length - 1].y;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    animRef.current = requestAnimationFrame(draw);
  }, [data, color, height, propWidth, min, max, gradient, glowWidth, lineWidth]);

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: propWidth || '100%', height }}
      className="block"
    />
  );
}
