import { apiClient } from "./client";

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
  user: User;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", data);
  return response.data!;
}

export async function register(data: RegisterRequest): Promise<User> {
  const response = await apiClient.post<User>("/api/auth/register", data);
  return response.data!;
}

export async function logout(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<User>("/api/auth/me");
    return response.success && response.data ? response.data : null;
  } catch {
    return null;
  }
}

