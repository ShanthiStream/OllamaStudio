export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: OllamaModelDetails;
}

export interface OllamaModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

export interface OllamaModelShow {
  modelfile: string;
  parameters: string;
  template: string;
  details: OllamaModelDetailInfo;
  model_info: Record<string, unknown>;
}

export interface OllamaModelDetailInfo {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

export interface OllamaRunningModel {
  name: string;
  model: string;
  size: number;
  size_vram: number;
  digest: string;
  details: OllamaModelDetails;
  expires_at: string;
  size_vram_mb: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
  metrics?: ChatMetrics;
  model?: string;
}

export interface ChatMetrics {
  tokens_per_second: number;
  latency_ms: number;
  first_token_ms: number;
  completion_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cpu_usage?: number;
  gpu_usage?: number;
  ram_usage_mb?: number;
  context_used?: number;
}

export interface ChatRequest {
  model: string;
  messages: Pick<ChatMessage, 'role' | 'content'>[];
  stream?: boolean;
  options?: Partial<ChatOptions>;
}

export interface ChatOptions {
  temperature: number;
  top_p: number;
  top_k: number;
  num_predict: number;
  stop: string[];
  num_ctx: number;
  repeat_penalty: number;
  seed: number;
  tfs_z: number;
  mirostat: number;
  mirostat_tau: number;
  mirostat_eta: number;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  os: string;
  cpu: CpuInfo;
  gpu: GpuInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  battery: BatteryInfo;
  network: NetworkInfo;
  temperature: number | null;
  uptime: number;
  machine: string;
}

export interface CpuInfo {
  model: string;
  cores: number;
  physical_cores: number;
  usage: number;
  speed_mhz: number;
  is_apple_silicon: boolean;
}

export interface GpuInfo {
  model: string;
  cores: number;
  usage: number;
  memory_total_mb: number;
  memory_used_mb: number;
  memory_free_mb: number;
  has_neural_engine: boolean;
  neural_engine_cores?: number;
}

export interface MemoryInfo {
  total_gb: number;
  used_gb: number;
  available_gb: number;
  usage_percent: number;
  swap_total_gb: number;
  swap_used_gb: number;
  swap_usage_percent: number;
}

export interface DiskInfo {
  total_gb: number;
  used_gb: number;
  free_gb: number;
  usage_percent: number;
  read_mbps: number;
  write_mbps: number;
}

export interface BatteryInfo {
  has_battery: boolean;
  is_charging: boolean;
  percent: number;
  time_remaining_minutes: number | null;
}

export interface NetworkInfo {
  is_connected: boolean;
  rx_bytes: number;
  tx_bytes: number;
  rx_speed_mbps: number;
  tx_speed_mbps: number;
  interface_name: string;
}

export interface HardwareMetrics {
  timestamp: number;
  cpu: CpuInfo;
  gpu: GpuInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  network: NetworkInfo;
  battery: BatteryInfo;
  temperature: number | null;
}

export interface BenchmarkResult {
  id: string;
  model: string;
  timestamp: number;
  metrics: BenchmarkMetrics;
  prompt: string;
  config: BenchmarkConfig;
}

export interface BenchmarkMetrics {
  first_token_ms: number;
  completion_ms: number;
  tokens_per_second: number;
  ram_peak_mb: number;
  gpu_peak_mb: number;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface BenchmarkConfig {
  temperature: number;
  num_ctx: number;
  num_predict: number;
  prompt: string;
}

export interface ModelRecommendation {
  model: string;
  score: number;
  label: string;
  description: string;
  estimated_tps: number;
  estimated_memory_mb: number;
  badge: 'excellent' | 'great' | 'good' | 'acceptable' | 'heavy';
  use_cases: string[];
}

export interface DownloadableModel {
  name: string;
  description: string;
  family: string;
  size: string;
  parameters: string;
  quantization: string;
  tags: string[];
  capabilities: string[];
  license: string;
  creator: string;
  is_installed: boolean;
  download_size: string;
  last_updated: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  created_at: number;
  updated_at: number;
  is_favorite: boolean;
  is_pinned: boolean;
  tags: string[];
  token_count: number;
}

export interface FavoriteItem {
  id: string;
  type: 'model' | 'chat' | 'benchmark' | 'template';
  label: string;
  description?: string;
  added_at: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  created_at: number;
  updated_at: number;
  usage_count: number;
  is_favorite: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export type Theme = 'dark' | 'light' | 'system';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal';

export interface AppSettings {
  theme: Theme;
  accent_color: AccentColor;
  animations: boolean;
  refresh_interval: number;
  streaming: boolean;
  api_endpoint: string;
  parallel_requests: number;
  default_model: string;
  default_temperature: number;
  default_top_p: number;
  default_num_ctx: number;
  performance_mode: boolean;
  developer_mode: boolean;
  debug_logs: boolean;
}

export interface OllamaStatus {
  running: boolean;
  version: string;
  api_healthy: boolean;
  average_latency_ms: number;
  requests_per_second: number;
  current_queue: number;
  streaming_requests: number;
  error?: string;
}
