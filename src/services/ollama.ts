import axios from 'axios';
import type { OllamaModel, OllamaModelShow, OllamaRunningModel, ChatMessage, ChatRequest, OllamaStatus } from '@/types';

const API_ENDPOINT = process.env.NEXT_PUBLIC_OLLAMA_API_URL || '/ollama-api';

const api = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('Ollama is not running. Please start Ollama and try again.');
    }
    throw error;
  }
);

export const ollamaService = {
  async listModels(): Promise<OllamaModel[]> {
    const { data } = await api.get('/api/tags');
    return data.models || [];
  },

  async showModel(name: string): Promise<OllamaModelShow> {
    const { data } = await api.post('/api/show', { name });
    return data;
  },

  async listRunningModels(): Promise<OllamaRunningModel[]> {
    const { data } = await api.get('/api/ps');
    return data.models || [];
  },

  async chat(request: ChatRequest, onChunk?: (chunk: string) => void): Promise<string> {
    if (request.stream && onChunk) {
      const response = await fetch(`${API_ENDPOINT}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';
      let inThinking = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              const content = parsed.message?.content || '';
              const thinking = parsed.message?.thinking || '';
              let text = '';
              if (thinking) {
                if (!inThinking) {
                  text += '<think>\n';
                  inThinking = true;
                }
                text += thinking;
              } else if (content) {
                if (inThinking) {
                  text += '\n</think>\n\n';
                  inThinking = false;
                }
                text += content;
              }
              if (text) {
                fullContent += text;
                onChunk(text);
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                throw e;
              }
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            const content = parsed.message?.content || '';
            const thinking = parsed.message?.thinking || '';
            let text = '';
            if (thinking) {
              if (!inThinking) {
                text += '<think>\n';
                inThinking = true;
              }
              text += thinking;
            } else if (content) {
              if (inThinking) {
                text += '\n</think>\n\n';
                inThinking = false;
              }
              text += content;
            }
            if (text) {
              fullContent += text;
              onChunk(text);
            }
            if (parsed.done) {
              if (inThinking) {
                fullContent += '\n</think>';
                onChunk('\n</think>');
                inThinking = false;
              }
              return fullContent;
            }
          } catch (e) {
            if (e instanceof Error && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }
      }

      if (inThinking) {
        fullContent += '\n</think>';
        onChunk('\n</think>');
        inThinking = false;
      }
      return fullContent;
    }

    const { data } = await api.post('/api/chat', { ...request, stream: false });
    return data.message?.content || '';
  },

  async generate(model: string, prompt: string): Promise<string> {
    const { data } = await api.post('/api/generate', { model, prompt, stream: false });
    return data.response || '';
  },

  async pullModel(
    name: string,
    onProgress?: (progress: { status: string; completed?: number; total?: number; percent?: number }) => void
  ): Promise<void> {
    const response = await fetch(`${API_ENDPOINT}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, stream: true }),
    });

    if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer);
            if (onProgress) {
              let percent = 0;
              if (parsed.total && parsed.completed) {
                percent = Math.round((parsed.completed / parsed.total) * 100);
              }
              onProgress({
                status: parsed.status,
                completed: parsed.completed,
                total: parsed.total,
                percent,
              });
            }
          } catch {}
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (onProgress) {
            let percent = 0;
            if (parsed.total && parsed.completed) {
              percent = Math.round((parsed.completed / parsed.total) * 100);
            }
            onProgress({
              status: parsed.status,
              completed: parsed.completed,
              total: parsed.total,
              percent,
            });
          }
        } catch {}
      }
    }
  },

  async deleteModel(name: string): Promise<void> {
    await api.delete('/api/delete', { data: { name } });
  },

  async copyModel(source: string, destination: string): Promise<void> {
    await api.post('/api/copy', { source, destination });
  },

  async getVersion(): Promise<string> {
    try {
      const { data } = await api.get('/api/version');
      return data.version || 'unknown';
    } catch {
      return 'unavailable';
    }
  },

  async checkStatus(): Promise<OllamaStatus> {
    try {
      const start = performance.now();
      const versionData = await api.get('/api/version');
      const latency = performance.now() - start;
      const runningModels = await ollamaService.listRunningModels();

      return {
        running: true,
        version: versionData.data.version || 'unknown',
        api_healthy: true,
        average_latency_ms: Math.round(latency),
        requests_per_second: runningModels.length > 0 ? runningModels.length : 0,
        current_queue: 0,
        streaming_requests: 0,
      };
    } catch (error: any) {
      return {
        running: false,
        version: 'unavailable',
        api_healthy: false,
        average_latency_ms: 0,
        requests_per_second: 0,
        current_queue: 0,
        streaming_requests: 0,
        error: error.message,
      };
    }
  },
};
