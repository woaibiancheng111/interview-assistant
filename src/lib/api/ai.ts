import { apiClient } from "./client";
import type {
  KeywordAnalysisResult,
  HighlightExtraction,
  ResumeOptimizationResult,
  ResumeSnapshot,
} from "@/lib/services/ai-service";

export async function analyzeKeywordMatch(
  model: string,
  jdText: string,
  resume: ResumeSnapshot
): Promise<KeywordAnalysisResult> {
  const response = await apiClient.post<KeywordAnalysisResult>("/api/ai/resume", {
    action: "keyword",
    model,
    jdText,
    resume,
  });
  return response.data!;
}

export async function extractHighlights(
  model: string,
  resume: ResumeSnapshot
): Promise<HighlightExtraction[]> {
  const response = await apiClient.post<HighlightExtraction[]>("/api/ai/resume", {
    action: "highlights",
    model,
    resume,
  });
  return response.data!;
}

export async function optimizeForJD(
  model: string,
  jdText: string,
  resume: ResumeSnapshot
): Promise<ResumeOptimizationResult> {
  const response = await apiClient.post<ResumeOptimizationResult>("/api/ai/resume", {
    action: "optimize",
    model,
    jdText,
    resume,
  });
  return response.data!;
}
