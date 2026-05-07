import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, login, logout, getCurrentUser, LoginRequest, RegisterRequest, register } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  register: (credentials: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await login(credentials);
          set({
            user: response.user,
            isLoggedIn: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (credentials) => {
        set({ isLoading: true });
        try {
          await register(credentials);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await logout();
          set({
            user: null,
            isLoggedIn: false,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          const user = await getCurrentUser();
          if (user) {
            set({ user, isLoggedIn: true });
            return true;
          } else {
            set({ user: null, isLoggedIn: false });
            return false;
          }
        } catch {
          set({ user: null, isLoggedIn: false });
          return false;
        }
      },

      clearSession: () => {
        set({ user: null, isLoggedIn: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
