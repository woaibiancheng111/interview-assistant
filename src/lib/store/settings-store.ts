import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AISettings {
  dashscopeModel: string;
}

interface SettingsStore {
  aiSettings: AISettings;
  setDashscopeModel: (model: string) => void;
  resetAISettings: () => void;
}

const defaultAISettings: AISettings = {
  dashscopeModel: "qwen-plus",
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      aiSettings: { ...defaultAISettings },

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
