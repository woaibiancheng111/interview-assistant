import { apiClient, setAuthToken, removeAuthToken, getAuthToken } from "./client";

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", data);
  if (response.success && response.data) {
    setAuthToken(response.data.token);
  }
  return response.data!;
}

export async function register(data: RegisterRequest): Promise<User> {
  const response = await apiClient.post<User>("/api/auth/register", data);
  return response.data!;
}

export async function logout(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    await apiClient.post("/api/auth/logout");
  }
  removeAuthToken();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<User>("/api/auth/me");
    return response.success && response.data ? response.data : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
