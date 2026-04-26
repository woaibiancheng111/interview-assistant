import { apiClient } from "./client";
import { QuestionStatus } from "@prisma/client";

export interface AnswerRecord {
  id: string;
  userId: string;
  questionId: string;
  status: QuestionStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
}

export interface UpsertAnswerRecordRequest {
  questionId: string;
  status: QuestionStatus;
  note?: string;
}

export async function getAnswerRecords(): Promise<AnswerRecord[]> {
  const response = await apiClient.get<AnswerRecord[]>("/api/answers");
  return response.data || [];
}

export async function getAnswerRecord(questionId: string): Promise<AnswerRecord | null> {
  const response = await apiClient.get<AnswerRecord>(`/api/answers/${questionId}`);
  return response.data || null;
}

export async function upsertAnswerRecord(data: UpsertAnswerRecordRequest): Promise<AnswerRecord> {
  const response = await apiClient.post<AnswerRecord>("/api/answers", data);
  return response.data!;
}

export async function deleteAnswerRecord(questionId: string): Promise<void> {
  await apiClient.delete(`/api/answers/${questionId}`);
}

export async function getFavorites(): Promise<Favorite[]> {
  const response = await apiClient.get<Favorite[]>("/api/favorites");
  return response.data || [];
}

export async function toggleFavorite(questionId: string): Promise<boolean> {
  const response = await apiClient.post<{ isFavorite: boolean }>(`/api/favorites/${questionId}`);
  return response.data?.isFavorite ?? false;
}

export async function checkFavorite(questionId: string): Promise<boolean> {
  const response = await apiClient.get<{ isFavorite: boolean }>(`/api/favorites/${questionId}`);
  return response.data?.isFavorite ?? false;
}
