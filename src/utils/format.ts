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
  if (!paramSize) return 0;
  if (/^\d+(\.\d+)?$/.test(paramSize)) {
    const rawVal = parseFloat(paramSize);
    return rawVal / 1000000000;
  }
  const match = paramSize.match(/([\d.]+)([TBMK])/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'T') return value * 1000;
  if (unit === 'B') return value;
  if (unit === 'M') return value / 1000;
  if (unit === 'K') return value / 1000000;
  return 0;
}

export function formatParameterSize(size: string): string {
  if (!size) return '';
  if (/^\d+(\.\d+)?$/.test(size)) {
    const rawVal = parseFloat(size);
    if (rawVal >= 1000000000000) {
      const val = rawVal / 1000000000000;
      return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)}T`;
    }
    if (rawVal >= 1000000000) {
      const val = rawVal / 1000000000;
      return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}B`;
    }
    if (rawVal >= 1000000) {
      const val = rawVal / 1000000;
      return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
    }
    if (rawVal >= 1000) {
      const val = rawVal / 1000;
      return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
    }
    return size;
  }
  const match = size.match(/([\d.]+)([TBMK])/i);
  if (!match) return size;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'B' && value >= 1000) {
    const val = value / 1000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)}T`;
  }
  if (unit === 'M' && value >= 1000) {
    const val = value / 1000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}B`;
  }
  return size;
}

export function formatParameterSizeLong(formattedSize: string): string {
  if (!formattedSize) return '';
  const match = formattedSize.match(/([\d.]+)([TBMK])/i);
  if (!match) return formattedSize;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const nameMap: Record<string, string> = {
    T: 'Trillion',
    B: 'Billion',
    M: 'Million',
    K: 'Thousand'
  };
  return `${value} ${nameMap[unit] || unit}`;
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

export function detectModelCapabilities(name: string, details: any): string[] {
  const capabilities: string[] = [];
  const modelName = name.toLowerCase();
  const modelInfo = details?.model_info || {};
  const architecture = (modelInfo['general.architecture'] || '').toLowerCase();
  
  // 1. Is it an Embedding model?
  const isEmbedding = modelName.includes('embed') || 
                      modelName.includes('similarity') ||
                      architecture === 'bert' || 
                      architecture === 'nomic' ||
                      modelName.includes('minilm');
  
  if (isEmbedding) {
    capabilities.push('Embeddings');
    capabilities.push('Semantic Search');
    capabilities.push('Text Similarity');
    return capabilities;
  }

  // 2. Is it a Vision model?
  const hasProjector = details?.projector_info !== undefined && details?.projector_info !== null;
  const isVision = modelName.includes('vision') || 
                   modelName.includes('llava') || 
                   modelName.includes('moondream') || 
                   modelName.includes('minicpm-v') ||
                   modelName.includes('vl') ||
                   architecture === 'mllama' ||
                   hasProjector;

  // 3. Is it a Coding model?
  const isCoding = modelName.includes('code') || 
                   modelName.includes('coder') || 
                   modelName.includes('starcoder') || 
                   modelName.includes('stable-code');

  // 4. Is it a Reasoning model?
  const isReasoning = modelName.includes('reason') || 
                      modelName.includes('deepseek-r') || 
                      modelName.includes('qwq') ||
                      modelName.includes('o1-') ||
                      modelName.includes('o3-');

  // 5. Is it a Chat / Instruct model?
  const isBaseModel = modelName.includes('-base') || 
                      (modelName.includes('llama') && !modelName.includes('instruct') && !modelName.includes('chat') && !modelName.includes('latest'));
  const isChat = !isBaseModel;

  // 6. Does it support Tool Calling?
  const isTiny = modelName.includes('tiny') || modelName.includes('0.5b') || modelName.includes('0.8b');
  const supportsToolCalling = isChat && !isReasoning && !isTiny;

  // Build capabilities
  capabilities.push('Text Generation');
  if (isChat) capabilities.push('Chat / Dialogue');
  if (isCoding) capabilities.push('Code Synthesis & Debugging');
  if (isReasoning) capabilities.push('Deep Reasoning & Chain-of-Thought');
  if (isVision) capabilities.push('Vision & Image Analysis');
  if (supportsToolCalling) capabilities.push('Tool Calling / Function Calling');
  
  if (!modelName.includes('starcoder')) {
    capabilities.push('Multilingual');
  }

  return capabilities;
}
