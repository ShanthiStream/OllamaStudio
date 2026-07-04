'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Brain, HardDrive, Gauge, Box,
  Star, Copy, ChevronDown, ChevronUp,
  MemoryStick as MemoryIcon, Zap, Clock, Info
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useModelDetails, useOllamaModels } from '@/hooks/useOllama';
import { useSystemInfo } from '@/hooks/useHardwareMonitor';
import { formatBytes, formatParameterSize, formatParameterSizeLong, extractModelFamily } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MODEL_FAMILIES, QUANTIZATION_LEVELS } from '@/constants';
import { estimateModelPerformance } from '@/utils/performance';
import { useState } from 'react';

export default function ModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(params.name as string);
  const { data: details, isLoading } = useModelDetails(name);
  const { data: models } = useOllamaModels();
  const { systemInfo } = useSystemInfo();
  const [showRaw, setShowRaw] = useState(false);

  const installedModel = (models || []).find(m => m.name === name);
  const family = extractModelFamily(name);
  const familyInfo = MODEL_FAMILIES[family];
  const modelInfo = details?.model_info || {};
  const quant = details?.details?.quantization_level?.toLowerCase() || '';
  const quantInfo = QUANTIZATION_LEVELS[quant];
  const paramSize = details?.details?.parameter_size || 
                    (modelInfo['general.parameter_count'] ? String(modelInfo['general.parameter_count']) : '') || 
                    '7B';

  const general = extractGeneralInfo(modelInfo);
  const modelSize = installedModel?.size || (general.size > 0 ? general.size : 0);
  let contextLength = extractContextLength(modelInfo);
  if (contextLength === 'Unknown') {
    if (name.toLowerCase().includes('openai') || name.toLowerCase().includes('gpt-4')) {
      contextLength = '128K';
    } else if (name.toLowerCase().includes('anthropic') || name.toLowerCase().includes('claude')) {
      contextLength = '200K';
    } else if (name.toLowerCase().includes('google') || name.toLowerCase().includes('gemini')) {
      contextLength = '1M';
    }
  }

  const systemRAM = systemInfo?.memory?.total_gb || 16;
  const availableRAM = systemInfo?.memory?.available_gb || 10;
  const isAppleSilicon = systemInfo?.cpu?.is_apple_silicon ?? true;
  const gpuMemoryMB = systemInfo?.gpu?.memory_total_mb || 0;

  const perf = estimateModelPerformance(name, paramSize, quant, systemRAM, availableRAM, isAppleSilicon, gpuMemoryMB);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 rounded-full"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl lg:col-span-2" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <PageHeader
              title={name.replace(/:latest$/, '')}
              description={familyInfo?.description || 'Local AI Model'}
            >
              <Button variant="outline" size="sm" className="rounded-full">
                <Star className="w-4 h-4 mr-2" />
                Favorite
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy Name
              </Button>
            </PageHeader>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Performance Analysis</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Performance', value: perf.label.charAt(0).toUpperCase() + perf.label.slice(1), icon: Zap, color: 'text-amber-500' },
                    { label: 'Est. Tokens/sec', value: `${perf.expected_tps}`, icon: Gauge, color: 'text-cyan-500' },
                    { label: 'Est. Memory', value: formatBytes(perf.memory_usage_mb * 1024 * 1024), icon: MemoryIcon, color: 'text-violet-500' },
                    { label: 'First Token', value: `${perf.expected_first_token_ms}ms`, icon: Clock, color: 'text-rose-500' },
                  ].map((item, i) => (
                    <div key={item.label} className="glass rounded-lg p-4 text-center">
                      <item.icon className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
                      <p className="text-sm font-semibold">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {perf.recommendations.map((rec, i) => (
                    <div key={`rec-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Human Explanation</h2>
                <div className="space-y-4">
                  <div className="p-4 glass rounded-lg">
                    <p className="text-sm font-medium mb-1">Quantization: {quant.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {quantInfo?.description || 'Standard quantization level'} &mdash; {quantInfo?.quality || 'Unknown'} quality, {quantInfo?.size || 'Unknown'} size.
                    </p>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <p className="text-sm font-medium mb-1">Context Length</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {getContextExplanation(contextLength)}
                    </p>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <p className="text-sm font-medium mb-1">Parameters: {formatParameterSize(paramSize)}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This model has approximately {formatParameterSizeLong(formatParameterSize(paramSize))} parameters. Larger models generally have more knowledge and capacity but require more compute resources.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Text Generation', present: true },
                    { label: 'Chat', present: true },
                    { label: 'Coding', present: family.includes('code') || name.toLowerCase().includes('code') },
                    { label: 'Reasoning', present: name.toLowerCase().includes('reason') || name.toLowerCase().includes('deepseek') },
                    { label: 'Vision', present: name.toLowerCase().includes('llava') || name.toLowerCase().includes('vision') },
                    { label: 'Multilingual', present: true },
                    { label: 'Tool Calling', present: !name.toLowerCase().includes('tiny') },
                  ].filter(c => c.present).map((c, i) => (
                    <Badge key={c.label} variant="secondary" className="px-3 py-1">
                      {c.label}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-card rounded-xl p-6">
                <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Model Info</h2>
                <div className="space-y-3">
                  <InfoRow label="Family" value={familyInfo?.name || family} />
                  <InfoRow label="Context Length" value={contextLength} />
                  <InfoRow label="Parameters" value={formatParameterSize(paramSize)} />
                  <InfoRow label="Format" value={details?.details?.format || 'GGUF'} />
                  <InfoRow label="Quantization" value={quant.toUpperCase()} />
                  <InfoRow label="Size" value={modelSize > 0 ? formatBytes(modelSize) : 'Unknown'} />
                </div>
              </Card>

              <Card className="glass-card rounded-xl p-6">
                <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
                  Performance Score
                </h2>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{perf.score}/100</div>
                  <Badge className={`text-sm px-3 py-1 ${
                    perf.label === 'excellent' ? 'bg-emerald-500/10 text-emerald-500' :
                    perf.label === 'great' ? 'bg-blue-500/10 text-blue-500' :
                    perf.label === 'good' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {perf.label.charAt(0).toUpperCase() + perf.label.slice(1)}
                  </Badge>
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRaw(!showRaw)}
              className="rounded-full"
            >
              {showRaw ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
              Raw Metadata
            </Button>
            {showRaw && details && (
              <Card className="glass-card rounded-xl p-4 mt-3">
                <pre className="text-xs overflow-auto max-h-96 text-muted-foreground font-mono">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function extractGeneralInfo(modelInfo: Record<string, unknown>) {
  const size = (modelInfo['general.file_size'] || 
                modelInfo['general.size'] || 0) as number;
  return { size };
}

function extractContextLength(modelInfo: Record<string, unknown>): string {
  const key = Object.keys(modelInfo).find(k => k.endsWith('.context_length'));
  if (key && modelInfo[key]) {
    const val = Number(modelInfo[key]);
    if (!isNaN(val)) {
      if (val >= 1024) {
        return `${(val / 1024).toFixed(0)}K`;
      }
      return `${val}`;
    }
  }
  return 'Unknown';
}

function getContextExplanation(contextStr: string): string {
  if (contextStr === 'Unknown') {
    return 'Context length information is not specified for this model. It will operate on default parameters.';
  }
  const match = contextStr.match(/(\d+)K/i);
  if (match) {
    const kVal = parseInt(match[1]);
    const tokens = kVal * 1024;
    const approxWords = Math.round(tokens * 0.75);
    const approxPages = Math.round(tokens / 700);
    return `This model has a context window of ${contextStr} (${tokens.toLocaleString()} tokens). It can read and remember about ${approxWords.toLocaleString()} words (roughly equivalent to a ${approxPages}-page book or document) in a single conversation.`;
  }
  if (contextStr.toLowerCase().includes('m')) {
    const val = parseFloat(contextStr);
    const tokens = val * 1000000;
    const approxPages = Math.round(tokens / 700);
    return `This model has a massive context window of ${contextStr} (${tokens.toLocaleString()} tokens). It can analyze around ${approxPages.toLocaleString()} pages of text (e.g., several thick manuals or whole codebases) at once.`;
  }
  const val = parseInt(contextStr);
  if (!isNaN(val)) {
    const approxWords = Math.round(val * 0.75);
    return `This model can process up to ${val.toLocaleString()} tokens (about ${approxWords.toLocaleString()} words) in its active memory.`;
  }
  return `This model can process up to ${contextStr} tokens in its active memory.`;
}
