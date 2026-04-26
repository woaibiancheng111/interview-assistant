import { apiClient } from "./client";
import { JobStatus, InterviewResult } from "@prisma/client";

export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  position: string;
  status: JobStatus;
  salary: string;
  location: string;
  jobUrl: string;
  notes: string;
  appliedDate: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewRecord {
  id: string;
  userId: string;
  jobId: string;
  companyName: string;
  position: string;
  round: string;
  date: string;
  time: string;
  result: InterviewResult;
  notes: string;
  interviewer: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  companyName: string;
  position: string;
  status?: JobStatus;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  appliedDate?: string;
}

export interface UpdateJobRequest {
  id: string;
  companyName?: string;
  position?: string;
  status?: JobStatus;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
}

export interface CreateInterviewRequest {
  jobId?: string;
  companyName?: string;
  position?: string;
  round: string;
  date: string;
  time?: string;
  result?: InterviewResult;
  notes?: string;
  interviewer?: string;
}

export interface GetJobsOptions {
  status?: JobStatus;
  search?: string;
}

export async function getJobs(options?: GetJobsOptions): Promise<JobApplication[]> {
  const params = new URLSearchParams();
  if (options?.status) params.append("status", options.status);
  if (options?.search) params.append("search", options.search);
  
  const queryString = params.toString();
  const url = queryString ? `/api/jobs?${queryString}` : "/api/jobs";
  
  const response = await apiClient.get<JobApplication[]>(url);
  return response.data || [];
}

export async function getJob(id: string): Promise<JobApplication> {
  const response = await apiClient.get<JobApplication>(`/api/jobs/${id}`);
  return response.data!;
}

export async function createJob(data: CreateJobRequest): Promise<JobApplication> {
  const response = await apiClient.post<JobApplication>("/api/jobs", data);
  return response.data!;
}

export async function updateJob(id: string, data: Partial<CreateJobRequest>): Promise<JobApplication> {
  const response = await apiClient.put<JobApplication>(`/api/jobs/${id}`, data);
  return response.data!;
}

export async function deleteJob(id: string): Promise<void> {
  await apiClient.delete(`/api/jobs/${id}`);
}

export async function getInterviews(jobId?: string): Promise<InterviewRecord[]> {
  const url = jobId ? `/api/interviews?jobId=${jobId}` : "/api/interviews";
  const response = await apiClient.get<InterviewRecord[]>(url);
  return response.data || [];
}

export async function createInterview(data: CreateInterviewRequest): Promise<InterviewRecord> {
  const response = await apiClient.post<InterviewRecord>("/api/interviews", data);
  return response.data!;
}

export async function updateInterview(id: string, data: Partial<CreateInterviewRequest>): Promise<InterviewRecord> {
  const response = await apiClient.put<InterviewRecord>(`/api/interviews/${id}`, data);
  return response.data!;
}

export async function deleteInterview(id: string): Promise<void> {
  await apiClient.delete(`/api/interviews/${id}`);
}
