import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useQuestionStore } from "@/lib/store/question-store";
import { useJobStore } from "@/lib/store/job-store";
import { useInterviewStore } from "@/lib/store/interview-store";
import { syncService } from "@/lib/store/sync-service";
import { QuestionStatus, JobStatus, InterviewResult, InterviewType } from "@prisma/client";

export function useDataSync() {
  const { isLoggedIn } = useAuthStore();
  const questionStore = useQuestionStore();
  const jobStore = useJobStore();
  const interviewStore = useInterviewStore();

  const syncFromApi = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const [answerRecords, favorites, jobs, interviews, mockInterviews] = await Promise.all([
        syncService.syncAnswerRecordsFromApi(),
        syncService.syncFavoritesFromApi(),
        syncService.syncJobsFromApi(),
        syncService.syncInterviewsFromApi(),
        syncService.syncMockInterviewsFromApi(),
      ]);

      const { setAnswerRecords, setFavorites } = useQuestionStore.getState();
      const { setJobList, setInterviewRecords } = useJobStore.getState();
      const { setHistory } = useInterviewStore.getState();

      if (Object.keys(answerRecords).length > 0) {
        setAnswerRecords(answerRecords);
      }
      if (favorites.size > 0) {
        setFavorites(favorites);
      }

      if (jobs.length > 0) {
        setJobList(jobs);
      }
      if (interviews.length > 0) {
        setInterviewRecords(interviews);
      }
    } catch (error) {
      console.error("Data sync failed:", error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      syncFromApi();
    }
  }, [isLoggedIn, syncFromApi]);

  return {
    syncFromApi,
    isLoggedIn,
  };
}

declare module "@/lib/store/question-store" {
  interface QuestionStore {
    setAnswerRecords: (records: Record<string, { questionId: string; status: QuestionStatus; note: string; updatedAt: number }>) => void;
    setFavorites: (favorites: Set<string>) => void;
  }
}

declare module "@/lib/store/job-store" {
  interface JobState {
    setJobList: (jobs: Array<{
      id: string;
      companyName: string;
      position: string;
      status: JobStatus;
      salary: string;
      location: string;
      jobUrl: string;
      notes: string;
      appliedDate: string;
      lastUpdated: string;
    }>) => void;
    setInterviewRecords: (interviews: Array<{
      id: string;
      jobId: string;
      companyName: string;
      position: string;
      round: string;
      date: string;
      time: string;
      result: InterviewResult;
      notes: string;
      interviewer: string;
    }>) => void;
  }
}

declare module "@/lib/store/interview-store" {
  interface InterviewStore {
    setHistory: (history: Array<{
      id: string;
      type: InterviewType;
      typeLabel: string;
      date: string;
      overallScore: number;
      maxScore: number;
      questionCount: number;
    }>) => void;
  }
}
