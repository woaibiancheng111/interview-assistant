import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useQuestionStore } from "@/lib/store/question-store";
import { useJobStore } from "@/lib/store/job-store";
import { useInterviewStore } from "@/lib/store/interview-store";
import { syncService } from "@/lib/store/sync-service";

export function useDataSync() {
  const { isLoggedIn } = useAuthStore();

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
      if (mockInterviews.length > 0) {
        setHistory(mockInterviews);
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
