export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatTokensPerSecond(tps: number): string {
  return `${tps.toFixed(1)} tok/s`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

export function extractModelFamily(name: string): string {
  const parts = name.split(/[:\/]/);
  return parts[0].toLowerCase();
}

export function getParameterCount(paramSize: string): number {
  const match = paramSize.match(/([\d.]+)([BMK])/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'B') return value;
  if (unit === 'M') return value / 1000;
  if (unit === 'K') return value / 1000000;
  return 0;
}

export function formatParameterSize(size: string): string {
  const match = size.match(/([\d.]+)([BMK])/i);
  if (!match) return size;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (value >= 1000 && unit === 'M') return `${(value / 1000).toFixed(1)}B`;
  if (value >= 1000 && unit === 'B') return `${(value).toFixed(0)}B`;
  return size;
}

export function isCloudModel(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes('cloud') ||
    lower.startsWith('openai/') ||
    lower.startsWith('anthropic/') ||
    lower.startsWith('google/')
  );
}
