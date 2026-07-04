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
  // 1. Detect if this is a Cloud Model (OpenAI, Anthropic, Google, or named cloud)
  const isCloud = modelName.toLowerCase().includes('cloud') || 
                  modelName.toLowerCase().startsWith('openai/') || 
                  modelName.toLowerCase().startsWith('anthropic/') || 
                  modelName.toLowerCase().startsWith('google/');

  if (isCloud) {
    let cloudScore = 98;
    if (modelName.toLowerCase().includes('haiku') || modelName.toLowerCase().includes('mini') || modelName.toLowerCase().includes('flash')) {
      cloudScore = 95; // Fast, cost-efficient cloud models
    } else if (modelName.toLowerCase().includes('opus') || modelName.toLowerCase().includes('3-5') || modelName.toLowerCase().includes('4o')) {
      cloudScore = 99; // Flagship powerhouse models
    }
    return {
      memory_usage_mb: 0,
      expected_tps: 65,
      expected_first_token_ms: 180,
      score: cloudScore,
      label: 'excellent',
      fits_in_ram: true,
      will_use_swap: false,
      recommendations: [
        'Runs in the cloud with zero local memory or processor overhead.',
        'Requires an active internet connection to communicate with API servers.',
        'Offers top-tier intelligence and logical capacity.'
      ],
    };
  }

  // 2. Local Model Performance Scoring
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

  // A. RAM Fitting Points (Max 40 pts)
  // Penalizes if the model size exceeds local system memory limits
  const fitsInRAM = memoryMB <= systemRAM_MB;
  const ramFittingPoints = fitsInRAM ? 40 : 10;
  const memPenalty = fitsInRAM ? 1 : 0.5;

  // B. Memory Pressure / Overhead (Max 25 pts)
  // Even if it fits, larger models leave less RAM for the system. Scale points based on overhead.
  const memoryOverheadRatio = Math.min(1, memoryMB / systemRAM_MB);
  const memoryOverheadPoints = fitsInRAM ? Math.round((1 - memoryOverheadRatio) * 25) : 0;

  // C. Speed Performance Score (Max 20 pts)
  // Smaller models execute tokens significantly faster. Scale based on parameter count.
  const speedFactor = Math.min(1, 4 / Math.max(1, params));
  const speedPoints = Math.round(speedFactor * 20);

  // D. Hardware Acceleration (Max 15 pts)
  // Reward active GPU acceleration or Apple Silicon platforms
  const hasGPU = isAppleSilicon || gpuMemoryMB > 0;
  const hardwareAccelerationPoints = hasGPU ? 15 : 5;

  // Compute total score
  const score = Math.max(5, Math.min(100, ramFittingPoints + memoryOverheadPoints + speedPoints + hardwareAccelerationPoints));

  const tpsBase = isAppleSilicon ? 40 : 25;
  const approxTps = tpsBase * speedFactor * memPenalty;
  const firstTokenMs = Math.max(100, 500 / Math.max(0.1, params * memPenalty));

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
