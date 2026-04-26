import { apiClient } from "./client";
import { InterviewType } from "@prisma/client";

export interface MockInterview {
  id: string;
  userId: string;
  type: InterviewType;
  typeLabel: string;
  startTime: string;
  endTime: string;
  duration: number;
  overallScore: number;
  maxScore: number;
  questionCount: number;
  summary: string;
  suggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMockInterviewRequest {
  type: InterviewType;
  typeLabel?: string;
  startTime: Date | string;
  endTime: Date | string;
  duration: number;
  overallScore: number;
  maxScore?: number;
  questionCount?: number;
  summary?: string;
  suggestions?: string[];
}

export interface GetMockInterviewsOptions {
  type?: InterviewType;
  limit?: number;
}

export async function getMockInterviews(options?: GetMockInterviewsOptions): Promise<MockInterview[]> {
  const params = new URLSearchParams();
  if (options?.type) params.append("type", options.type);
  if (options?.limit) params.append("limit", options.limit.toString());
  
  const queryString = params.toString();
  const url = queryString ? `/api/mock-interviews?${queryString}` : "/api/mock-interviews";
  
  const response = await apiClient.get<MockInterview[]>(url);
  return response.data || [];
}

export async function getMockInterview(id: string): Promise<MockInterview> {
  const response = await apiClient.get<MockInterview>(`/api/mock-interviews/${id}`);
  return response.data!;
}

export async function createMockInterview(data: CreateMockInterviewRequest): Promise<MockInterview> {
  const response = await apiClient.post<MockInterview>("/api/mock-interviews", {
    ...data,
    startTime: data.startTime instanceof Date ? data.startTime.toISOString() : data.startTime,
    endTime: data.endTime instanceof Date ? data.endTime.toISOString() : data.endTime,
  });
  return response.data!;
}

export async function deleteMockInterview(id: string): Promise<void> {
  await apiClient.delete(`/api/mock-interviews/${id}`);
}
