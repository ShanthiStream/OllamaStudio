import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const metricsHistory: any[] = [];
const MAX_HISTORY = 120;

let prevNetworkStats = { rxBytes: 0, txBytes: 0, time: Date.now() };

function getCPUModel() {
  const cpus = os.cpus();
  if (cpus.length > 0) {
    return cpus[0].model.trim();
  }
  return 'Unknown';
}

function isAppleSilicon() {
  return process.arch === 'arm64' && process.platform === 'darwin';
}

async function getMacOSTemperature() {
  try {
    if (process.platform === 'darwin') {
      const { stdout } = await execPromise(
        "sudo powermetrics --samplers smc -i 1 -n 1 --show-process-energy 2>/dev/null | grep 'CPU die temperature' | awk '{print $NF}' | head -1"
      ).catch(() => ({ stdout: '' }));
      const temp = parseFloat(stdout);
      return isNaN(temp) ? null : temp;
    }
    return null;
  } catch {
    return null;
  }
}

async function getGPUInfo() {
  try {
    if (process.platform === 'darwin') {
      const { stdout } = await execPromise(
        "system_profiler SPDisplaysDataType 2>/dev/null | grep -E 'Chipset Model|VRAM' | head -4"
      ).catch(() => ({ stdout: '' }));
      const lines = stdout.split('\n').filter(Boolean);
      const model = lines[0]?.replace('Chipset Model:', '').trim() || 'Apple GPU';

      let memoryTotalMB = 0;
      if (isAppleSilicon()) {
        const totalMem = os.totalmem() / (1024 * 1024);
        memoryTotalMB = Math.round(totalMem * 0.7);
      } else {
        const vram = lines.find(l => l.includes('VRAM'));
        const match = vram?.match(/(\d+)/);
        memoryTotalMB = match ? parseInt(match[1]) * 1024 : 8192;
      }

      return { model, memoryTotalMB };
    }
    return { model: 'Unknown GPU', memoryTotalMB: 0 };
  } catch {
    return { model: 'Unknown GPU', memoryTotalMB: 0 };
  }
}

async function getGPUUsage() {
  try {
    if (process.platform === 'darwin' && isAppleSilicon()) {
      const { stdout } = await execPromise(
        "sudo powermetrics --samplers gpu_power -i 100 -n 1 --show-process-energy 2>/dev/null | grep 'GPU utilization' | awk '{print $NF}' | head -1"
      ).catch(() => ({ stdout: '' }));
      const usage = parseFloat(stdout);
      return isNaN(usage) ? 0 : usage;
    }
    return 0;
  } catch {
    return 0;
  }
}

async function getDiskIO() {
  try {
    if (process.platform === 'darwin') {
      const { stdout } = await execPromise(
        "vm_stat 2>/dev/null | head -20"
      ).catch(() => ({ stdout: '' }));
      const pagesIn = stdout.match(/pageins\s+(\d+)/i);
      const pagesOut = stdout.match(/pageouts\s+(\d+)/i);
      return {
        readSpeed: pagesIn ? Math.round(parseInt(pagesIn[1]) * 16384 / 1024 / 1024) : 0,
        writeSpeed: pagesOut ? Math.round(parseInt(pagesOut[1]) * 16384 / 1024 / 1024) : 0,
      };
    }
    return { readSpeed: 0, writeSpeed: 0 };
  } catch {
    return { readSpeed: 0, writeSpeed: 0 };
  }
}

async function getBatteryInfo() {
  try {
    if (process.platform === 'darwin') {
      const { stdout } = await execPromise(
        "pmset -g batt 2>/dev/null | grep -E '([0-9]+%).*' | head -1"
      ).catch(() => ({ stdout: '' }));
      const match = stdout.match(/(\d+)%/);
      const charging = stdout.includes('charging') || stdout.includes('AC');
      const percent = match ? parseInt(match[1]) : 100;
      return {
        hasBattery: !!stdout,
        isCharging: charging,
        percent,
        timeRemaining: null,
      };
    }
    return { hasBattery: false, isCharging: true, percent: 100, timeRemaining: null };
  } catch {
    return { hasBattery: false, isCharging: true, percent: 100, timeRemaining: null };
  }
}

async function getNetworkStats() {
  try {
    if (process.platform === 'darwin') {
      const { stdout } = await execPromise(
        "netstat -ib 2>/dev/null | grep -E 'en0|en1' | head -2"
      ).catch(() => ({ stdout: '' }));
      const parts = stdout.split(/\s+/);
      const rxBytes = parseInt(parts[6] || '0') || 0;
      const txBytes = parseInt(parts[9] || '0') || 0;
      return { rxBytes, txBytes };
    }
    return { rxBytes: 0, txBytes: 0 };
  } catch {
    return { rxBytes: 0, txBytes: 0 };
  }
}

export async function getSystemInfo() {
  const cpuModel = getCPUModel();
  const gpuInfo = await getGPUInfo();
  const totalMem = os.totalmem() / (1024 * 1024 * 1024);
  const freeMem = os.freemem() / (1024 * 1024 * 1024);

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    os: `${os.type()} ${os.release()}`,
    machine: isAppleSilicon() ? 'Apple Silicon' : os.machine(),
    cpu: {
      model: cpuModel,
      cores: os.cpus().length,
      physical_cores: Math.round(os.cpus().length / 2),
      usage: 0,
      speed_mhz: os.cpus()[0]?.speed || 0,
      is_apple_silicon: isAppleSilicon(),
    },
    gpu: {
      model: gpuInfo.model,
      cores: 0,
      usage: 0,
      memory_total_mb: gpuInfo.memoryTotalMB,
      memory_used_mb: 0,
      memory_free_mb: gpuInfo.memoryTotalMB,
      has_neural_engine: isAppleSilicon(),
      neural_engine_cores: isAppleSilicon() ? 16 : 0,
    },
    memory: {
      total_gb: Math.round(totalMem * 10) / 10,
      used_gb: Math.round((totalMem - freeMem) * 10) / 10,
      available_gb: Math.round(freeMem * 10) / 10,
      usage_percent: Math.round(((totalMem - freeMem) / totalMem) * 100 * 10) / 10,
      swap_total_gb: 0,
      swap_used_gb: 0,
      swap_usage_percent: 0,
    },
    disk: {
      total_gb: 0,
      used_gb: 0,
      free_gb: 0,
      usage_percent: 0,
      read_mbps: 0,
      write_mbps: 0,
    },
    battery: await getBatteryInfo(),
    network: {
      is_connected: true,
      rx_bytes: 0,
      tx_bytes: 0,
      rx_speed_mbps: 0,
      tx_speed_mbps: 0,
      interface_name: 'en0',
    },
    temperature: await getMacOSTemperature(),
    uptime: os.uptime(),
  };
}

export async function getSystemMetrics() {
  const totalMem = os.totalmem() / (1024 * 1024 * 1024);
  const freeMem = os.freemem() / (1024 * 1024 * 1024);
  const cpuUsage = os.cpus().reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total) * 100;
  }, 0) / os.cpus().length;

  const gpuInfo = await getGPUInfo();
  const gpuUsage = await getGPUUsage();
  const batteryInfo = await getBatteryInfo();
  const networkStats = await getNetworkStats();
  const temperature = await getMacOSTemperature();
  const diskIO = await getDiskIO();

  const now = Date.now();
  const timeDiff = (now - prevNetworkStats.time) / 1000;

  const rxSpeed = timeDiff > 0
    ? Math.max(0, (networkStats.rxBytes - prevNetworkStats.rxBytes) / timeDiff) * 8 / (1024 * 1024)
    : 0;
  const txSpeed = timeDiff > 0
    ? Math.max(0, (networkStats.txBytes - prevNetworkStats.txBytes) / timeDiff) * 8 / (1024 * 1024)
    : 0;

  prevNetworkStats = { ...networkStats, time: now };

  const swapTotal = 0;
  const swapUsed = 0;

  const metric = {
    timestamp: now,
    cpu: {
      model: getCPUModel(),
      cores: os.cpus().length,
      physical_cores: Math.round(os.cpus().length / 2),
      usage: Math.round(cpuUsage * 10) / 10,
      speed_mhz: os.cpus()[0]?.speed || 0,
      is_apple_silicon: isAppleSilicon(),
    },
    gpu: {
      model: gpuInfo.model,
      cores: 0,
      usage: Math.round(gpuUsage * 10) / 10,
      memory_total_mb: gpuInfo.memoryTotalMB,
      memory_used_mb: Math.round(gpuInfo.memoryTotalMB * (gpuUsage / 100)),
      memory_free_mb: Math.round(gpuInfo.memoryTotalMB * (1 - gpuUsage / 100)),
      has_neural_engine: isAppleSilicon(),
      neural_engine_cores: isAppleSilicon() ? 16 : 0,
    },
    memory: {
      total_gb: Math.round(totalMem * 10) / 10,
      used_gb: Math.round((totalMem - freeMem) * 10) / 10,
      available_gb: Math.round(freeMem * 10) / 10,
      usage_percent: Math.round(((totalMem - freeMem) / totalMem) * 100 * 10) / 10,
      swap_total_gb: Math.round(swapTotal * 10) / 10,
      swap_used_gb: Math.round(swapUsed * 10) / 10,
      swap_usage_percent: swapTotal > 0 ? Math.round((swapUsed / swapTotal) * 100 * 10) / 10 : 0,
    },
    disk: {
      total_gb: 0,
      used_gb: 0,
      free_gb: 0,
      usage_percent: 0,
      read_mbps: diskIO.readSpeed,
      write_mbps: diskIO.writeSpeed,
    },
    network: {
      is_connected: true,
      rx_bytes: networkStats.rxBytes,
      tx_bytes: networkStats.txBytes,
      rx_speed_mbps: Math.round(rxSpeed * 100) / 100,
      tx_speed_mbps: Math.round(txSpeed * 100) / 100,
      interface_name: 'en0',
    },
    battery: batteryInfo,
    temperature,
  };

  metricsHistory.push(metric);
  if (metricsHistory.length > MAX_HISTORY) metricsHistory.shift();

  return metric;
}

export function getMetricsHistory() {
  return metricsHistory;
}
