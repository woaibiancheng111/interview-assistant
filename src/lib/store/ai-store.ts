import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIModelProvider = "openai" | "ollama" | "custom";
export type ChatRole = "user" | "assistant" | "system";
export type ChatContextType = "general" | "question" | "interview" | "resume" | "search";

export interface AIConfig {
  provider: AIModelProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  contextType?: ChatContextType;
  contextId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  contextType: ChatContextType;
  contextId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface STARCheckResult {
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  score: number;
  suggestions: string[];
  rawAnalysis: string;
}

export interface ResumeOptimizationResult {
  overallScore: number;
  matchPercentage: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimizedContent: string;
}

export interface SemanticSearchResult {
  questionId: string;
  score: number;
  reason: string;
}

interface AIStore {
  config: AIConfig;
  updateConfig: (config: Partial<AIConfig>) => void;
  resetConfig: () => void;

  isChatOpen: boolean;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;

  currentSessionId: string | null;
  sessions: ChatSession[];

  createSession: (contextType?: ChatContextType, contextId?: string) => string;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearAllSessions: () => void;

  addMessage: (role: ChatRole, content: string, contextType?: ChatContextType, contextId?: string) => void;
  updateMessage: (messageId: string, content: string) => void;

  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  lastSTARCheck: STARCheckResult | null;
  setLastSTARCheck: (result: STARCheckResult | null) => void;

  lastResumeOptimization: ResumeOptimizationResult | null;
  setLastResumeOptimization: (result: ResumeOptimizationResult | null) => void;

  semanticSearchResults: SemanticSearchResult[];
  setSemanticSearchResults: (results: SemanticSearchResult[]) => void;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;

  getCurrentSession: () => ChatSession | undefined;
  getMessagesByContext: (contextType: ChatContextType, contextId?: string) => ChatMessage[];
}

const defaultConfig: AIConfig = {
  provider: "openai",
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  maxTokens: 2000,
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      config: { ...defaultConfig },

      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),

      resetConfig: () => set({ config: { ...defaultConfig } }),

      isChatOpen: false,

      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

      setChatOpen: (open) => set({ isChatOpen: open }),

      currentSessionId: null,
      sessions: [],

      createSession: (contextType = "general", contextId) => {
        const newSession: ChatSession = {
          id: generateId(),
          title: "新对话",
          messages: [],
          contextType,
          contextId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));
        return newSession.id;
      },

      selectSession: (sessionId) => set({ currentSessionId: sessionId }),

      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSessionId:
            state.currentSessionId === sessionId
              ? state.sessions[0]?.id ?? null
              : state.currentSessionId,
        })),

      clearAllSessions: () => set({ sessions: [], currentSessionId: null }),

      addMessage: (role, content, contextType, contextId) => {
        const { currentSessionId, sessions } = get();
        let sessionId = currentSessionId;

        if (!sessionId) {
          sessionId = get().createSession(contextType, contextId);
        }

        const message: ChatMessage = {
          id: generateId(),
          role,
          content,
          timestamp: Date.now(),
          contextType,
          contextId,
        };

        set((state) => {
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === sessionId) {
              const updatedMessages = [...s.messages, message];
              let title = s.title;
              if (updatedMessages.length === 1 || s.title === "新对话") {
                title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
              }
              return {
                ...s,
                messages: updatedMessages,
                title,
                updatedAt: Date.now(),
              };
            }
            return s;
          });
          return { sessions: updatedSessions };
        });
      },

      updateMessage: (messageId, content) =>
        set((state) => ({
          sessions: state.sessions.map((s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.id === messageId ? { ...m, content } : m
            ),
          })),
        })),

      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      error: null,
      setError: (error) => set({ error }),

      lastSTARCheck: null,
      setLastSTARCheck: (result) => set({ lastSTARCheck: result }),

      lastResumeOptimization: null,
      setLastResumeOptimization: (result) => set({ lastResumeOptimization: result }),

      semanticSearchResults: [],
      setSemanticSearchResults: (results) => set({ semanticSearchResults: results }),
      lastSearchQuery: "",
      setLastSearchQuery: (query) => set({ lastSearchQuery: query }),

      getCurrentSession: () => {
        const { currentSessionId, sessions } = get();
        return sessions.find((s) => s.id === currentSessionId);
      },

      getMessagesByContext: (contextType, contextId) => {
        const { sessions } = get();
        const contextSession = sessions.find(
          (s) => s.contextType === contextType && s.contextId === contextId
        );
        return contextSession?.messages || [];
      },
    }),
    {
      name: "ai-store",
      partialize: (state) => ({
        config: state.config,
        sessions: state.sessions.slice(0, 20),
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);
