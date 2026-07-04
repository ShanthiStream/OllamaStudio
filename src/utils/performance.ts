import { getParameterCount, formatBytes } from './format';

export interface PerformanceEstimate {
  memory_usage_mb: number;
  expected_tps: number;
  expected_first_token_ms: number;
  score: number;
  label: 'excellent' | 'great' | 'good' | 'acceptable' | 'heavy';
  fits_in_ram: boolean;
  will_use_swap: boolean;
  recommendations: string[];
}

export function estimateModelPerformance(
  modelName: string,
  paramSize: string,
  quantization: string,
  systemRAM: number,
  availableRAM: number,
  isAppleSilicon: boolean,
  gpuMemoryMB: number
): PerformanceEstimate {
  const params = getParameterCount(paramSize);
  const isQ4 = quantization?.includes('q4');
  const isQ5 = quantization?.includes('q5');
  const isQ8 = quantization?.includes('q8');
  const isQ2 = quantization?.includes('q2');
  const isQ3 = quantization?.includes('q3');

  const bytesPerParam = isQ2 ? 0.26 : isQ3 ? 0.38 : isQ4 ? 0.55 : isQ5 ? 0.65 : isQ8 ? 0.85 : 1.6;
  const memoryMB = params * bytesPerParam * 1000 * 1.15;

  const systemRAM_MB = systemRAM * 1024;
  const availableRAM_MB = availableRAM * 1024;

  const tpsBase = isAppleSilicon ? 40 : 25;
  const paramFactor = Math.min(1, 7 / Math.max(1, params));
  const memPenalty = memoryMB > systemRAM_MB ? 0.5 : 1;
  const approxTps = tpsBase * paramFactor * memPenalty;

  const firstTokenMs = Math.max(100, 500 / Math.max(0.1, params * memPenalty));

  const score = Math.min(100, Math.round(
    (memPenalty * 40) +
    (paramFactor * 30) +
    ((isAppleSilicon ? 20 : 10)) +
    (memoryMB <= systemRAM_MB ? 10 : 0)
  ));

  let label: PerformanceEstimate['label'] = 'heavy';
  if (score >= 90) label = 'excellent';
  else if (score >= 75) label = 'great';
  else if (score >= 55) label = 'good';
  else if (score >= 35) label = 'acceptable';

  const recommendations: string[] = [];
  if (!isAppleSilicon && params > 13) recommendations.push('Consider a lower quantization (Q4) for better speed');
  if (memoryMB > systemRAM_MB) {
    recommendations.push(`Needs ~${formatBytes(memoryMB * 1024 * 1024)} RAM, but your system only has ${formatBytes(systemRAM * 1024 * 1024 * 1024)} total RAM`);
  } else if (memoryMB > availableRAM_MB) {
    recommendations.push(`Fits in total RAM, but currently available free RAM is low. Close other applications for peak performance.`);
  }
  if (isAppleSilicon && params <= 13) recommendations.push('Excellent match for Apple Silicon');
  if (params > 30) recommendations.push('Large model — may have high first-token latency');

  return {
    memory_usage_mb: Math.round(memoryMB),
    expected_tps: Math.round(approxTps),
    expected_first_token_ms: Math.round(firstTokenMs),
    score,
    label,
    fits_in_ram: memoryMB <= systemRAM_MB,
    will_use_swap: memoryMB > systemRAM_MB,
    recommendations,
  };
}
