'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Zap, Send, Bot, RefreshCw, Trash2, Gauge, Clock, Sliders, ChevronRight,
  Sparkles, Check, Play, StopCircle, FileText, AlertCircle, X, HelpCircle, Plus
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useOllamaModels, useChat } from '@/hooks/useOllama';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { ChatStreamVisualizer } from '@/components/chat/ChatStreamVisualizer';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { isCloudModel } from '@/utils/format';
import type { ChatMessage, Conversation, PromptTemplate } from '@/types';

const DEFAULT_SYSTEM_PROMPT = 'You are a helpful AI assistant. Respond concisely and accurately.';

const getModelMessages = (modelName: string, allMessages: ChatMessage[]) => {
  const result: ChatMessage[] = [];
  allMessages.forEach(msg => {
    if (msg.role === 'user' || msg.role === 'system') {
      result.push(msg);
    } else if (msg.role === 'assistant') {
      if (!msg.model || msg.model === modelName) {
        result.push(msg);
      }
    }
  });
  return result;
};

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get('id');

  const { data: models, isLoading: modelsLoading } = useOllamaModels();
  const localModels = (models || []).filter(m => !isCloudModel(m.name));
  const { sendMessage } = useChat();

  const {
    conversations,
    addConversation,
    updateConversation,
    templates
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Streaming and metrics states per model
  const [isStreamingMap, setIsStreamingMap] = useState<Record<string, boolean>>({});
  const [responsesMap, setResponsesMap] = useState<Record<string, string>>({});
  const [tpsMap, setTpsMap] = useState<Record<string, number>>({});
  const [latencyMap, setLatencyMap] = useState<Record<string, number>>({});
  const [firstTokenMap, setFirstTokenMap] = useState<Record<string, number>>({});
  const [tokenCountMap, setTokenCountMap] = useState<Record<string, number>>({});

  // Advanced Tuning states
  const [showParams, setShowParams] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [numCtx, setNumCtx] = useState(4096);
  const [numPredict, setNumPredict] = useState(500);

  // Template triggers states
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [filledVars, setFilledVars] = useState<Record<string, string>>({});
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentIdRef = useRef<string | null>(null);
  const abortControllersRef = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    return () => {
      // Clean up any running generations on unmount
      Object.values(abortControllersRef.current).forEach(ac => ac.abort());
    };
  }, []);

  // Update currentIdRef so streaming callbacks always read the latest ID
  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  // Load conversation from ID query parameter
  useEffect(() => {
    if (mounted && conversations.length > 0) {
      if (conversationId) {
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
          setTimeout(() => {
            setCurrentId(conversationId);
            // Split models if stored as comma-separated
            const modelsToSelect = conv.model.split(',').filter(Boolean);
            setSelectedModels(modelsToSelect);
            // Reset local streaming overlays
            setResponsesMap({});
            setIsStreamingMap({});
            setTpsMap({});
            setLatencyMap({});
            setFirstTokenMap({});
            setTokenCountMap({});
          }, 0);
        }
      } else {
        // Set defaults if no ID is present
        setTimeout(() => {
          setCurrentId(null);
          if (localModels.length > 0 && selectedModels.length === 0) {
            setSelectedModels([localModels[0].name]);
          }
        }, 0);
      }
    }
  }, [conversationId, conversations, mounted, localModels, selectedModels.length]);

  // Set default model on models list load if nothing is selected
  useEffect(() => {
    if (localModels.length > 0 && selectedModels.length === 0 && !conversationId) {
      setTimeout(() => {
        setSelectedModels([localModels[0].name]);
      }, 0);
    }
  }, [localModels, selectedModels, conversationId]);

  const activeConv = conversations.find(c => c.id === currentId);
  const messages = activeConv ? activeConv.messages : [];

  const handleToggleModel = (modelName: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelName)) {
        // Keep at least one selected model
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== modelName);
      } else {
        return [...prev, modelName];
      }
    });
  };

  const handleSend = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;

    const userPrompt = prompt.trim();
    setPrompt('');
    setShowTemplates(false);

    // Cancel any active generations before starting a new turn
    Object.values(abortControllersRef.current).forEach(ac => ac.abort());
    abortControllersRef.current = {};

    const updatedUserMsg: ChatMessage = { role: 'user', content: userPrompt };
    let convId = currentId;

    if (!convId) {
      convId = crypto.randomUUID();
      const newConv: Conversation = {
        id: convId,
        title: userPrompt.slice(0, 35) || 'Playground Conversation',
        model: selectedModels.join(','),
        messages: [updatedUserMsg],
        created_at: Date.now(),
        updated_at: Date.now(),
        is_favorite: false,
        is_pinned: false,
        tags: [],
        token_count: 0
      };
      addConversation(newConv);
      setCurrentId(convId);
      // Update URL query parameter without full reload
      router.replace(`/playground?id=${convId}`, { scroll: false });
    } else {
      const activeMessages = useAppStore.getState().conversations.find(c => c.id === convId)?.messages || [];
      updateConversation(convId, {
        messages: [...activeMessages, updatedUserMsg],
        model: selectedModels.join(',') // update models list if it changed mid-convo
      });
    }

    // Set streaming states for selected models
    const initialStreaming: Record<string, boolean> = {};
    const initialResponses: Record<string, string> = {};
    const initialTps: Record<string, number> = {};
    const initialLatency: Record<string, number> = {};
    const initialFirstToken: Record<string, number> = {};
    const initialTokenCount: Record<string, number> = {};

    selectedModels.forEach(m => {
      initialStreaming[m] = true;
      initialResponses[m] = '';
      initialTps[m] = 0;
      initialLatency[m] = 0;
      initialFirstToken[m] = 0;
      initialTokenCount[m] = 0;
    });

    setIsStreamingMap(initialStreaming);
    setResponsesMap(initialResponses);
    setTpsMap(initialTps);
    setLatencyMap(initialLatency);
    setFirstTokenMap(initialFirstToken);
    setTokenCountMap(initialTokenCount);

    // Launch query streams for each model concurrently
    selectedModels.forEach(async (modelName) => {
      const ac = new AbortController();
      abortControllersRef.current[modelName] = ac;

      const startTime = performance.now();
      let firstTokenTime = 0;
      let modelResponse = '';
      const tokenTimestamps: number[] = [];

      // Prepend system prompt to the messages array sent to the API
      const convoMessages = useAppStore.getState().conversations.find(c => c.id === convId)?.messages || [];
      
      // Filter previous turns to construct a clean context for this specific model
      const modelConvoMessages = getModelMessages(modelName, convoMessages);
      
      const apiPayload = [];
      if (systemPrompt) {
        apiPayload.push({ role: 'system' as const, content: systemPrompt });
      }
      apiPayload.push(...modelConvoMessages.map(msg => ({ role: msg.role, content: msg.content })));

      const tpsInterval = setInterval(() => {
        const now = performance.now();
        const windowStart = now - 2000;
        const recent = tokenTimestamps.filter(t => t > windowStart);
        const tps = recent.length > 1 ? ((recent.length - 1) / 2) : 0;
        setTpsMap(prev => ({ ...prev, [modelName]: Math.round(tps * 10) / 10 }));
        setTokenCountMap(prev => ({ ...prev, [modelName]: modelResponse.length / 4 }));
      }, 300);

      try {
        await sendMessage(
          modelName,
          apiPayload,
          (chunk) => {
            if (ac.signal.aborted) return;
            if (!firstTokenTime) {
              firstTokenTime = performance.now() - startTime;
              setFirstTokenMap(prev => ({ ...prev, [modelName]: Math.round(firstTokenTime) }));
            }
            modelResponse += chunk;
            tokenTimestamps.push(performance.now());
            setResponsesMap(prev => ({ ...prev, [modelName]: (prev[modelName] || '') + chunk }));
          },
          {
            temperature,
            top_p: topP,
            num_ctx: numCtx,
            num_predict: numPredict
          }
        );

        clearInterval(tpsInterval);
        const finalDuration = performance.now() - startTime;
        const tokensCount = modelResponse.length / 4;
        const finalTps = tokensCount / (finalDuration / 1000);

        setLatencyMap(prev => ({ ...prev, [modelName]: Math.round(finalDuration) }));
        setTpsMap(prev => ({ ...prev, [modelName]: Math.round(finalTps) }));
        setIsStreamingMap(prev => ({ ...prev, [modelName]: false }));

        // Append completed assistant message into the Zustand store
        const currentMessages = useAppStore.getState().conversations.find(c => c.id === convId)?.messages || [];
        updateConversation(convId, {
          messages: [
            ...currentMessages,
            {
              role: 'assistant',
              content: modelResponse,
              model: modelName,
              metrics: {
                tokens_per_second: Math.round(finalTps),
                latency_ms: Math.round(finalDuration),
                first_token_ms: Math.round(firstTokenTime),
                completion_ms: Math.round(finalDuration),
                prompt_tokens: Math.round(tokensCount * 0.3),
                completion_tokens: Math.round(tokensCount),
                total_tokens: Math.round(tokensCount * 1.3)
              }
            }
          ]
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        clearInterval(tpsInterval);
        setIsStreamingMap(prev => ({ ...prev, [modelName]: false }));
        toast.error(`Error generating from ${modelName}: ${errMsg}`);
      }
    });
  };

  const handleReset = () => {
    Object.values(abortControllersRef.current).forEach(ac => ac.abort());
    abortControllersRef.current = {};
    setResponsesMap({});
    setIsStreamingMap({});
    setTpsMap({});
    setLatencyMap({});
    setFirstTokenMap({});
    setTokenCountMap({});
    setPrompt('');
    setCurrentId(null);
    router.replace('/playground', { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);

    // Look for slash autocomplete trigger
    const words = value.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('/')) {
      setShowTemplates(true);
      setTemplateSearch(lastWord.slice(1));
    } else {
      setShowTemplates(false);
    }
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setShowTemplates(false);
    setSelectedTemplate(template);
    
    // Check if variables need to be filled
    if (template.variables && template.variables.length > 0) {
      const initialVars: Record<string, string> = {};
      template.variables.forEach(v => {
        initialVars[v] = '';
      });
      setFilledVars(initialVars);
      setTemplateModalOpen(true);
    } else {
      // Insert raw content
      insertTemplateContent(template.content);
    }
  };

  const insertTemplateContent = (content: string) => {
    setPrompt(prev => {
      const index = prev.lastIndexOf('/');
      const prefix = index >= 0 ? prev.slice(0, index) : prev;
      return prefix + content;
    });
    textareaRef.current?.focus();
  };

  const handleSaveTemplateVars = () => {
    if (!selectedTemplate) return;
    let finalContent = selectedTemplate.content;
    Object.entries(filledVars).forEach(([key, val]) => {
      finalContent = finalContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
    });
    insertTemplateContent(finalContent);
    setTemplateModalOpen(false);
    setSelectedTemplate(null);
  };

  // Filter templates list based on search trigger
  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    t.content.toLowerCase().includes(templateSearch.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col relative overflow-hidden">
      <PageHeader
        title="Playground"
        description="Interact and compare model configurations side-by-side"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setShowParams(!showParams)}
          >
            <Sliders className="w-4 h-4 mr-2" />
            Parameters
          </Button>
          {(currentId || selectedModels.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-destructive hover:bg-destructive/10"
              onClick={handleReset}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Convo
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Model Selection Badge Row */}
      {modelsLoading ? (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 mb-4 select-none pb-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider select-none shrink-0 mr-1">Active Models:</span>
          
          {selectedModels.map(modelName => (
            <Badge
              key={modelName}
              variant="default"
              className="px-3 py-1 rounded-full select-none transition-all flex items-center gap-1.5 bg-accent-color text-white shadow-sm font-medium h-8"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{modelName.replace(/:latest$/, '')}</span>
              {selectedModels.length > 1 && (
                <span className="text-[9px] bg-white/20 text-white rounded-full px-1.5 py-0.5">
                  {selectedModels.indexOf(modelName) + 1}
                </span>
              )}
              <button
                onClick={() => handleToggleModel(modelName)}
                disabled={selectedModels.length === 1}
                className="hover:bg-white/20 rounded-full p-0.5 ml-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full h-8 px-3 border border-dashed border-accent-color/50 text-accent-color hover:bg-accent-color/5 hover:border-accent-color cursor-pointer text-xs font-medium inline-flex items-center justify-center outline-none select-none">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Model
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 max-h-72 overflow-y-auto">
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground select-none">Select models to compare</div>
                <DropdownMenuSeparator className="my-1 border-t border-border/30" />
                {localModels.map(m => {
                  const isSelected = selectedModels.includes(m.name);
                  return (
                    <DropdownMenuItem
                      key={m.name}
                      className="flex items-center justify-between py-2 cursor-pointer"
                      onClick={() => handleToggleModel(m.name)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Bot className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="text-xs truncate font-medium">{m.name.replace(/:latest$/, '')}</span>
                      </div>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-accent-color shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Main Dynamic Columns Space */}
      <div
        className="flex-1 grid gap-4 min-h-0 relative mb-4 items-stretch"
        style={{
          gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))`
        }}
      >
        {selectedModels.map((modelName) => {
          const modelMessages = getModelMessages(modelName, messages);
          const streamingResponse = responsesMap[modelName];
          const isStreaming = isStreamingMap[modelName];

          const tps = tpsMap[modelName] || 0;
          const latency = latencyMap[modelName] || 0;
          const firstToken = firstTokenMap[modelName] || 0;
          const tokensCount = tokenCountMap[modelName] || 0;

          return (
            <Card
              key={modelName}
              className="glass-card rounded-xl overflow-hidden flex flex-col border border-border/40 relative shadow-sm"
            >
              {/* Header bar */}
              <div className="p-3 bg-muted/40 border-b border-border/40 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-2 py-0.5 bg-background border-border/50 text-[11px] font-semibold text-accent-color">
                    <Bot className="w-3.5 h-3.5 mr-1 text-accent-color" />
                    {modelName.replace(/:latest$/, '')}
                  </Badge>
                </div>
                {/* Generation speed / status indicators */}
                {isStreaming ? (
                  <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Streaming
                  </span>
                ) : (
                  latency > 0 && (
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                      <span>{tps.toFixed(0)} tok/s</span>
                      <span>{latency}ms</span>
                    </div>
                  )
                )}
              </div>

              {/* Chat Column Messages List */}
              <ScrollArea className="flex-1 p-4 h-full relative">
                {modelMessages.length === 0 && !streamingResponse ? (
                  <div className="h-full flex items-center justify-center flex-col text-center opacity-60 px-4 py-20">
                    <Bot className="w-10 h-10 mb-3 text-muted-foreground/80 animate-pulse" />
                    <p className="text-sm font-medium">Awaiting prompt...</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">Send a message to compare generation output.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modelMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 ${
                            msg.role === 'user'
                              ? 'bg-accent-color text-white shadow-sm font-medium'
                              : 'glass border border-border/30 text-foreground'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none break-words font-sans leading-relaxed text-sm">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          )}
                        </div>
                        {msg.role === 'assistant' && msg.metrics && (
                          <span className="text-[9px] text-muted-foreground mt-1.5 ml-2 font-mono flex items-center gap-2 select-none">
                            <span><Gauge className="w-3 h-3 inline mr-0.5" />{msg.metrics.tokens_per_second} tok/s</span>
                            <span><Clock className="w-3 h-3 inline mr-0.5" />{msg.metrics.latency_ms}ms</span>
                            {msg.metrics.first_token_ms && (
                              <span><Zap className="w-3 h-3 inline mr-0.5" />1st: {msg.metrics.first_token_ms}ms</span>
                            )}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Active streaming block */}
                    {streamingResponse && (
                      <div className="flex flex-col items-start animate-fade-in">
                        <div className="max-w-[85%] rounded-2xl p-3.5 glass border border-border/30 text-foreground">
                          <div className="prose prose-sm dark:prose-invert max-w-none break-words font-sans leading-relaxed text-sm">
                            <ReactMarkdown>{streamingResponse}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Streaming Canvas Sine Waves */}
                    {isStreaming && (
                      <div className="mt-2 px-2">
                        <ChatStreamVisualizer
                          isStreaming={isStreaming}
                          tokensPerSecond={tps}
                          firstTokenLatency={firstToken}
                          totalTokens={Math.round(tokensCount)}
                          compact
                        />
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </Card>
          );
        })}
      </div>

      {/* Autocomplete Template Dropdown List */}
      <AnimatePresence>
        {showTemplates && filteredTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-[80px] left-3 right-3 z-30 glass shadow-2xl rounded-2xl p-2 max-h-[220px] overflow-y-auto border border-border/60"
          >
            <div className="text-[10px] uppercase font-bold text-muted-foreground px-3 py-1.5 tracking-wider select-none border-b border-border/30 mb-1">
              Select Prompt Template
            </div>
            {filteredTemplates.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-accent/60 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                  <span className="font-semibold truncate">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[250px]">— {t.description}</span>
                </div>
                {t.variables.length > 0 && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 scale-90 bg-muted/65">
                    {t.variables.length} vars
                  </Badge>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Prompt Input Block */}
      <div className="glass-card rounded-xl p-3 shadow-lg shrink-0 border border-border/50 relative">
        <div className="flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a prompt... (Type / for saved templates)"
            className="min-h-[44px] max-h-[120px] resize-none border-none bg-transparent focus-visible:ring-0 p-2 shadow-none text-sm placeholder:text-muted-foreground/60 leading-relaxed flex-1"
            rows={1}
          />
          <div className="flex items-center gap-2 pb-1">
            {Object.values(isStreamingMap).some(Boolean) ? (
              <Button
                onClick={() => {
                  Object.values(abortControllersRef.current).forEach(ac => ac.abort());
                  abortControllersRef.current = {};
                  setIsStreamingMap(selectedModels.reduce((acc, m) => ({ ...acc, [m]: false }), {}));
                }}
                variant="secondary"
                size="icon"
                className="rounded-full w-10 h-10 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                <StopCircle className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                size="icon"
                className="rounded-full w-10 h-10 bg-accent-color text-white shadow-sm shrink-0"
                disabled={!prompt.trim() || selectedModels.length === 0}
              >
                <Send className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/75 px-2 pt-2 border-t border-border/20 mt-1 select-none">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {systemPrompt !== DEFAULT_SYSTEM_PROMPT && (
            <span className="text-[9px] text-accent-color font-medium">Custom System Prompt active</span>
          )}
        </div>
      </div>

      {/* Advanced Parameters Slider Drawer (Using BaseUI Portal dialog safety) */}
      {mounted && (
        <Sheet open={showParams} onOpenChange={setShowParams}>
          <SheetContent side="right" className="w-[360px] sm:max-w-md p-6 overflow-y-auto">
            <SheetHeader className="border-b border-border/30 pb-4 mb-4 select-none">
              <SheetTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Sliders className="w-5 h-5 text-accent-color" />
                Advanced Parameters
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Fine-tune generation temperature, context size, and token prediction properties.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-2 select-none">
              {/* System Prompt Input */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground flex justify-between">
                  <span>System Prompt</span>
                  {systemPrompt !== DEFAULT_SYSTEM_PROMPT && (
                    <button
                      onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}
                      className="text-[10px] text-accent-color hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="System instructions..."
                  className="h-20 text-xs resize-none"
                />
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground">Temperature</Label>
                  <span className="font-mono text-xs font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
                    {temperature.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground font-medium">0.0 (Strict)</span>
                  <Slider
                    value={[temperature]}
                    onValueChange={(val) => setTemperature(Array.isArray(val) ? val[0] : val)}
                    min={0.0}
                    max={2.0}
                    step={0.05}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">2.0 (Creative)</span>
                </div>
              </div>

              {/* Top P Slider */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground">Top-P (Nucleus Sampling)</Label>
                  <span className="font-mono text-xs font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
                    {topP.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[topP]}
                  onValueChange={(val) => setTopP(Array.isArray(val) ? val[0] : val)}
                  min={0.1}
                  max={1.0}
                  step={0.05}
                />
              </div>

              {/* Context Length Select */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Context Length (Tokens)</Label>
                <select
                  value={numCtx}
                  onChange={(e) => setNumCtx(Number(e.target.value))}
                  className="w-full text-xs h-9 rounded-md border border-border/80 bg-background px-3 py-1 outline-none ring-offset-background focus:ring-1 focus:ring-accent-color"
                >
                  <option value={2048}>2,048 tokens</option>
                  <option value={4096}>4,096 tokens (Default)</option>
                  <option value={8192}>8,192 tokens</option>
                  <option value={16384}>16,384 tokens</option>
                  <option value={32768}>32,768 tokens</option>
                </select>
              </div>

              {/* Max Prediction Tokens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground">Max Predict Tokens</Label>
                  <span className="font-mono text-xs font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
                    {numPredict} tokens
                  </span>
                </div>
                <Slider
                  value={[numPredict]}
                  onValueChange={(val) => setNumPredict(Array.isArray(val) ? val[0] : val)}
                  min={50}
                  max={2000}
                  step={50}
                />
              </div>
            </div>

            <SheetFooter className="border-t border-border/30 pt-4 mt-6">
              <Button
                variant="default"
                size="sm"
                className="w-full rounded-lg bg-accent-color text-white"
                onClick={() => setShowParams(false)}
              >
                Done
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {/* Variables Filler dialog (Using BaseUI Portal safety) */}
      {mounted && (
        <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader className="border-b border-border/30 pb-3 mb-2 select-none">
              <DialogTitle className="flex items-center gap-1.5 text-base font-bold text-foreground">
                <Sparkles className="w-5 h-5 text-accent-color" />
                Fill Template Variables
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Fill values for placeholders before submitting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 select-none">
              {selectedTemplate && selectedTemplate.variables.map(v => (
                <div key={v} className="space-y-1.5">
                  <Label className="text-xs font-semibold capitalize text-muted-foreground">{v.replace('_', ' ')}</Label>
                  <Input
                    value={filledVars[v] || ''}
                    onChange={(e) => setFilledVars(prev => ({ ...prev, [v]: e.target.value }))}
                    placeholder={`Enter value for ${v}...`}
                    className="h-9 text-xs"
                  />
                </div>
              ))}
            </div>

            <DialogFooter className="border-t border-border/30 pt-3 mt-4">
              <Button variant="outline" size="sm" onClick={() => setTemplateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-accent-color text-white"
                onClick={handleSaveTemplateVars}
                disabled={Object.values(filledVars).some(val => !val.trim())}
              >
                Insert Prompt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-accent-color border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground">Loading playground...</p>
        </div>
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}
