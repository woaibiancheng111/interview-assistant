import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AISettings {
  dashscopeApiKey: string;
  dashscopeModel: string;
}

interface SettingsStore {
  aiSettings: AISettings;
  setDashscopeApiKey: (apiKey: string) => void;
  setDashscopeModel: (model: string) => void;
  resetAISettings: () => void;
}

const defaultAISettings: AISettings = {
  dashscopeApiKey: "",
  dashscopeModel: "qwen-plus",
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      aiSettings: { ...defaultAISettings },

      setDashscopeApiKey: (apiKey) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, dashscopeApiKey: apiKey },
        })),

      setDashscopeModel: (model) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, dashscopeModel: model },
        })),

      resetAISettings: () =>
        set({
          aiSettings: { ...defaultAISettings },
        }),
    }),
    {
      name: "settings-storage",
    }
  )
);
