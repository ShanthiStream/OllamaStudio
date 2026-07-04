export const API_ENDPOINT = process.env.NEXT_PUBLIC_OLLAMA_API_URL || 'http://localhost:11434';
export const SYSTEM_API_ENDPOINT = process.env.NEXT_PUBLIC_SYSTEM_API_URL || '';

export const REFRESH_INTERVALS = {
  DASHBOARD: 2000,
  HARDWARE: 1000,
  RUNNING_MODELS: 3000,
  OLLAMA_STATUS: 5000,
  NOTIFICATIONS: 10000,
  METRICS_HISTORY: 1000,
} as const;

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/' },
  { id: 'models', label: 'Models', icon: 'Brain', href: '/models' },
  { id: 'chat', label: 'Chat Arena', icon: 'MessageSquare', href: '/chat' },
  { id: 'benchmarks', label: 'Benchmarks', icon: 'BarChart3', href: '/benchmarks' },
  { id: 'running', label: 'Running Models', icon: 'Play', href: '/running' },
  { id: 'system', label: 'System Monitor', icon: 'Activity', href: '/system' },
  { id: 'templates', label: 'Templates', icon: 'FileText', href: '/templates' },
  { id: 'playground', label: 'Prompt Playground', icon: 'Zap', href: '/playground' },
  { id: 'history', label: 'History', icon: 'Clock', href: '/history' },
  { id: 'favorites', label: 'Favorites', icon: 'Star', href: '/favorites' },
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings' },
  { id: 'about', label: 'About', icon: 'Info', href: '/about' },
] as const;

export const MODEL_FAMILIES: Record<string, { name: string; description: string; creator: string }> = {
  llama: { name: 'Llama', description: 'Meta\'s open-source large language model family', creator: 'Meta' },
  'mistral': { name: 'Mistral', description: 'Efficient and powerful model by Mistral AI', creator: 'Mistral AI' },
  'mixtral': { name: 'Mixtral', description: 'Mixture of Experts model by Mistral AI', creator: 'Mistral AI' },
  'codellama': { name: 'Code Llama', description: 'Code-specialized Llama model by Meta', creator: 'Meta' },
  'phi': { name: 'Phi', description: 'Small efficient models by Microsoft', creator: 'Microsoft' },
  'gemma': { name: 'Gemma', description: 'Lightweight models by Google DeepMind', creator: 'Google' },
  'qwen': { name: 'Qwen', description: 'Comprehensive model family by Alibaba', creator: 'Alibaba Cloud' },
  'qwen2': { name: 'Qwen 2', description: 'Next-gen Qwen models by Alibaba', creator: 'Alibaba Cloud' },
  'deepseek': { name: 'DeepSeek', description: 'Advanced reasoning models', creator: 'DeepSeek' },
  'llava': { name: 'LLaVA', description: 'Vision-language model', creator: 'UW-Madison' },
  'neural-chat': { name: 'Neural Chat', description: 'Chat-optimized model by Intel', creator: 'Intel' },
  'orca': { name: 'Orca', description: 'Research model by Microsoft', creator: 'Microsoft' },
  'starcoder': { name: 'StarCoder', description: 'Code generation model', creator: 'BigCode' },
  'starcoder2': { name: 'StarCoder 2', description: 'Code generation model v2', creator: 'BigCode' },
  'falcon': { name: 'Falcon', description: 'Model by Technology Innovation Institute', creator: 'TII' },
  'nomic-embed-text': { name: 'Nomic Embed Text', description: 'Text embedding model', creator: 'Nomic AI' },
  'mxbai-embed-large': { name: 'MXBAI Embed', description: 'Large embedding model', creator: 'Mixed Bread AI' },
  'command-r': { name: 'Command R', description: 'Enterprise-focused model by Cohere', creator: 'Cohere' },
  'dbrx': { name: 'DBRX', description: 'MoE model by Databricks', creator: 'Databricks' },
  'solar': { name: 'SOLAR', description: 'Efficient model by Upstage', creator: 'Upstage' },
  'openchat': { name: 'OpenChat', description: 'Open-source chat model', creator: 'OpenChat' },
  'zephyr': { name: 'Zephyr', description: 'Fine-tuned Mistral for chat', creator: 'Hugging Face' },
  'tinydolphin': { name: 'TinyDolphin', description: 'Small efficient model', creator: 'Microsoft' },
  'wizardcoder': { name: 'WizardCoder', description: 'Code-specialized model', creator: 'WizardLM' },
  'wizardlm': { name: 'WizardLM', description: 'Instruction-following model', creator: 'WizardLM' },
  'vicuna': { name: 'Vicuna', description: 'Chat-tuned LLaMA model', creator: 'LMSYS' },
};

export const QUANTIZATION_LEVELS: Record<string, { quality: string; size: string; description: string }> = {
  'q2_k': { quality: 'Very Low', size: 'Smallest', description: 'Maximum compression, significant quality loss' },
  'q3_k': { quality: 'Low', size: 'Very Small', description: 'High compression, noticeable quality loss' },
  'q3_k_s': { quality: 'Low', size: 'Very Small', description: 'High compression, small size' },
  'q3_k_m': { quality: 'Low', size: 'Very Small', description: 'Medium balance of size vs quality' },
  'q3_k_l': { quality: 'Low', size: 'Very Small', description: 'Larger version of Q3 with better quality' },
  'q4_0': { quality: 'Medium', size: 'Small', description: 'Good compression with decent quality' },
  'q4_1': { quality: 'Medium', size: 'Small', description: 'Slightly better quality than Q4_0' },
  'q4_k': { quality: 'Good', size: 'Medium', description: 'Balanced quality and size' },
  'q4_k_s': { quality: 'Good', size: 'Medium', description: 'Smaller Q4 with good quality' },
  'q4_k_m': { quality: 'Good', size: 'Medium', description: 'Recommended balance of quality and size' },
  'q5_0': { quality: 'High', size: 'Medium-Large', description: 'High quality, larger size' },
  'q5_1': { quality: 'High', size: 'Medium-Large', description: 'Higher quality than Q5_0' },
  'q5_k': { quality: 'High', size: 'Medium-Large', description: 'High quality with k-quant optimization' },
  'q5_k_s': { quality: 'High', size: 'Medium-Large', description: 'Compact high quality' },
  'q5_k_m': { quality: 'High', size: 'Medium-Large', description: 'Recommended high quality option' },
  'q6_k': { quality: 'Very High', size: 'Large', description: 'Very high quality, large size' },
  'q8_0': { quality: 'Excellent', size: 'Very Large', description: 'Near-lossless compression' },
  'f16': { quality: 'Lossless', size: 'Huge', description: 'Full 16-bit precision' },
  'f32': { quality: 'Original', size: 'Original', description: 'Full 32-bit precision (original)' },
  'iq1_s': { quality: 'Extreme', size: 'Minimal', description: 'Extreme quantization for minimal size' },
  'iq2_xxs': { quality: 'Ultra Low', size: 'Ultra Small', description: 'Ultra-low precision for testing' },
  'iq2_xs': { quality: 'Ultra Low', size: 'Ultra Small', description: 'Slightly better ultra-low precision' },
  'iq3_xxs': { quality: 'Very Low', size: 'Very Small', description: 'Extreme compression for small models' },
  'q2_k_s': { quality: 'Very Low', size: 'Smallest', description: 'Smallest practical quantization' },
};

export const CAPABILITIES: Record<string, { icon: string; label: string; color: string }> = {
  vision: { icon: 'Eye', label: 'Vision', color: 'text-violet-500' },
  embedding: { icon: 'Box', label: 'Embedding', color: 'text-blue-500' },
  tools: { icon: 'Wrench', label: 'Tool Calling', color: 'text-emerald-500' },
  coding: { icon: 'Code', label: 'Coding', color: 'text-cyan-500' },
  reasoning: { icon: 'Brain', label: 'Reasoning', color: 'text-amber-500' },
  multilingual: { icon: 'Languages', label: 'Multilingual', color: 'text-rose-500' },
  function_calling: { icon: 'FunctionSquare', label: 'Function Calling', color: 'text-indigo-500' },
};

export const DEFAULT_SETTINGS: import('@/types').AppSettings = {
  theme: 'system',
  accent_color: 'blue',
  animations: true,
  refresh_interval: 2000,
  streaming: true,
  api_endpoint: 'http://localhost:11434',
  parallel_requests: 2,
  default_model: '',
  default_temperature: 0.7,
  default_top_p: 0.9,
  default_num_ctx: 4096,
  performance_mode: false,
  developer_mode: false,
  debug_logs: false,
};

export const SYSTEM_MONITOR_API = 'http://localhost:3001';
