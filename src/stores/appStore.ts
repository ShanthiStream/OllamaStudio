import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, AccentColor, AppSettings, Notification, Conversation, FavoriteItem, PromptTemplate, BenchmarkResult } from '@/types';

interface AppState {
  theme: Theme;
  accentColor: AccentColor;
  sidebarOpen: boolean;
  notifications: Notification[];
  conversations: Conversation[];
  favorites: FavoriteItem[];
  templates: PromptTemplate[];
  settings: AppSettings;

  benchmarkResults: BenchmarkResult[];

  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => void;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void;
  deleteTemplate: (id: string) => void;
  incrementTemplateUsage: (id: string) => void;
  addBenchmarkResult: (result: BenchmarkResult) => void;
  clearBenchmarkResults: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      accentColor: 'blue',
      sidebarOpen: true,
      notifications: [],
      conversations: [],
      favorites: [],
      benchmarkResults: [],
      templates: [
        {
          id: 'template-default',
          name: 'General Chat',
          description: 'Standard conversational prompt',
          content: 'You are a helpful AI assistant. Answer the user\'s question concisely and accurately.',
          category: 'general',
          tags: ['chat', 'general'],
          variables: [],
          created_at: Date.now(),
          updated_at: Date.now(),
          usage_count: 0,
          is_favorite: true,
        },
        {
          id: 'template-coding',
          name: 'Code Review',
          description: 'Review code for bugs, style, and best practices',
          content: 'Review the following code for bugs, style issues, security vulnerabilities, and best practices. Provide specific suggestions for improvement.\n\n```\n{{code}}\n```',
          category: 'coding',
          tags: ['code', 'review', 'debug'],
          variables: ['code'],
          created_at: Date.now(),
          updated_at: Date.now(),
          usage_count: 0,
          is_favorite: false,
        },
        {
          id: 'template-summarize',
          name: 'Summarize Text',
          description: 'Summarize a given text concisely',
          content: 'Summarize the following text in a concise manner, capturing the key points:\n\n{{text}}',
          category: 'writing',
          tags: ['summarize', 'condense'],
          variables: ['text'],
          created_at: Date.now(),
          updated_at: Date.now(),
          usage_count: 0,
          is_favorite: false,
        },
        {
          id: 'template-explain',
          name: 'Explain Simply',
          description: 'Explain a complex topic in simple terms',
          content: 'Explain {{topic}} in simple terms as if I\'m a beginner. Use analogies and avoid jargon.',
          category: 'education',
          tags: ['explain', 'simplify', 'learn'],
          variables: ['topic'],
          created_at: Date.now(),
          updated_at: Date.now(),
          usage_count: 0,
          is_favorite: false,
        },
        {
          id: 'template-translate',
          name: 'Translate Text',
          description: 'Translate text to a target language',
          content: 'Translate the following text to {{language}}. Preserve the original tone and style:\n\n{{text}}',
          category: 'writing',
          tags: ['translate', 'language'],
          variables: ['language', 'text'],
          created_at: Date.now(),
          updated_at: Date.now(),
          usage_count: 0,
          is_favorite: false,
        },
        {
          id: 'template-brainstorm',
          name: 'Brainstorm Ideas',
          description: 'Generate creative ideas on a topic',
          content: 'Brainstorm creative ideas for {{topic}}. Consider different angles, unconventional approaches, and practical implementations.',
          category: 'creative',
          tags: ['brainstorm', 'ideas', 'creative'],
          variables: ['topic'],
          created_at: Date.now(),
          updated_at: Date.now(),
          usage_count: 0,
          is_favorite: false,
        },
        {
          id: 'template-write',
          name: 'Write a Blog Post',
          description: 'Generate a blog post outline and draft',
          content: 'Write a blog post about {{topic}} with the following structure:\n1. Catchy headline\n2. Introduction that hooks the reader\n3. Main body with {{sections}} key points\n4. Conclusion with takeaways\n5. Call to action\n\nTone: {{tone}}',
          category: 'writing',
          tags: ['blog', 'writing', 'content'],
          variables: ['topic', 'sections', 'tone'],
          created_at: Date.now(),
          updated_at: Date.now(),
          usage_count: 0,
          is_favorite: false,
        },
        {
          id: 'template-debug',
          name: 'Debug Error',
          description: 'Analyze and fix an error message',
          content: 'I encountered the following error:\n\n{{error}}\n\nContext:\n{{context}}\n\nExplain the cause and provide a solution.',
          category: 'coding',
          tags: ['debug', 'error', 'fix'],
          variables: ['error', 'context'],
          created_at: Date.now(),
          updated_at: Date.now(),
          usage_count: 0,
          is_favorite: false,
        },
      ],
      settings: {
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
      },

      setTheme: (theme) => set({ theme }),
      setAccentColor: (color) => set({ accentColor: color }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addNotification: (notification) =>
        set((s) => ({
          notifications: [
            { ...notification, id: crypto.randomUUID(), timestamp: Date.now(), read: false },
            ...s.notifications,
          ].slice(0, 50),
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      clearNotifications: () => set({ notifications: [] }),

      addConversation: (conversation) =>
        set((s) => ({ conversations: [conversation, ...s.conversations] })),

      updateConversation: (id, updates) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, ...updates, updated_at: Date.now() } : c
          ),
        })),

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
        })),

      addFavorite: (item) =>
        set((s) => ({ favorites: [{ ...item, added_at: Date.now() }, ...s.favorites] })),

      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      updateSettings: (newSettings) =>
        set((s) => ({ settings: { ...s.settings, ...newSettings } })),

      addTemplate: (template) =>
        set((s) => ({
          templates: [
            {
              ...template,
              id: crypto.randomUUID(),
              created_at: Date.now(),
              updated_at: Date.now(),
              usage_count: 0,
            },
            ...s.templates,
          ],
        })),

      updateTemplate: (id, updates) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updated_at: Date.now() } : t
          ),
        })),

      deleteTemplate: (id) =>
        set((s) => ({
          templates: s.templates.filter((t) => t.id !== id),
        })),

      incrementTemplateUsage: (id) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, usage_count: t.usage_count + 1 } : t
          ),
        })),

      addBenchmarkResult: (result) =>
        set((s) => ({ benchmarkResults: [result, ...s.benchmarkResults] })),

      clearBenchmarkResults: () => set({ benchmarkResults: [] }),
    }),
    {
      name: 'ollama-studio-storage',
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        sidebarOpen: state.sidebarOpen,
        conversations: state.conversations,
        favorites: state.favorites,
        templates: state.templates,
        settings: state.settings,
        benchmarkResults: state.benchmarkResults,
      }),
    }
  )
);
