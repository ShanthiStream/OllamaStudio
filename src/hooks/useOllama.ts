'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ollamaService } from '@/services/ollama';
import { useAppStore } from '@/stores/appStore';
import type { OllamaModel, OllamaRunningModel, OllamaStatus, ChatMessage, ChatRequest } from '@/types';

export function useOllamaModels() {
  return useQuery<OllamaModel[]>({
    queryKey: ['ollama-models'],
    queryFn: () => ollamaService.listModels(),
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useOllamaRunningModels() {
  return useQuery<OllamaRunningModel[]>({
    queryKey: ['ollama-running-models'],
    queryFn: () => ollamaService.listRunningModels(),
    refetchInterval: 5000,
    retry: 2,
  });
}

export function useOllamaStatus() {
  return useQuery<OllamaStatus>({
    queryKey: ['ollama-status'],
    queryFn: () => ollamaService.checkStatus(),
    refetchInterval: 10000,
    retry: 1,
    retryDelay: 2000,
  });
}

export function useModelDetails(name: string | null) {
  return useQuery({
    queryKey: ['ollama-model-details', name],
    queryFn: () => ollamaService.showModel(name!),
    enabled: !!name,
    retry: 1,
  });
}

export function useDeleteModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => ollamaService.deleteModel(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ollama-models'] });
    },
  });
}

export function useChat() {
  return {
    sendMessage: async (
      model: string,
      messages: Pick<ChatMessage, 'role' | 'content'>[],
      onChunk?: (chunk: string) => void,
      options?: Partial<ChatRequest['options']>
    ) => {
      return ollamaService.chat(
        { model, messages, stream: !!onChunk, options },
        onChunk
      );
    },
  };
}
