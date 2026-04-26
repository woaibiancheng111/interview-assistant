import {
  getAnswerRecords,
  upsertAnswerRecord,
  getFavorites,
  toggleFavorite as apiToggleFavorite,
  AnswerRecord as ApiAnswerRecord,
  Favorite as ApiFavorite,
} from "@/lib/api/questions";
import {
  getJobs,
  getInterviews,
  createJob,
  updateJob,
  deleteJob,
  createInterview,
  updateInterview,
  deleteInterview,
  JobApplication as ApiJobApplication,
  InterviewRecord as ApiInterviewRecord,
} from "@/lib/api/jobs";
import {
  getMockInterviews,
  createMockInterview,
  MockInterview as ApiMockInterview,
} from "@/lib/api/mock-interviews";
import { isAuthenticated } from "@/lib/api/auth";
import { QuestionStatus, JobStatus, InterviewResult, InterviewType } from "@prisma/client";

export interface LocalAnswerRecord {
  questionId: string;
  status: QuestionStatus;
  note: string;
  updatedAt: number;
}

export interface LocalJobApplication {
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
}

export interface LocalInterviewRecord {
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
}

export interface LocalMockInterview {
  id: string;
  type: InterviewType;
  typeLabel: string;
  date: string;
  overallScore: number;
  maxScore: number;
  questionCount: number;
}

function convertApiAnswerRecord(api: ApiAnswerRecord): LocalAnswerRecord {
  return {
    questionId: api.questionId,
    status: api.status,
    note: api.note,
    updatedAt: new Date(api.updatedAt).getTime(),
  };
}

function convertApiJobApplication(api: ApiJobApplication): LocalJobApplication {
  return {
    id: api.id,
    companyName: api.companyName,
    position: api.position,
    status: api.status,
    salary: api.salary,
    location: api.location,
    jobUrl: api.jobUrl,
    notes: api.notes,
    appliedDate: api.appliedDate,
    lastUpdated: api.lastUpdated,
  };
}

function convertApiInterviewRecord(api: ApiInterviewRecord): LocalInterviewRecord {
  return {
    id: api.id,
    jobId: api.jobId,
    companyName: api.companyName,
    position: api.position,
    round: api.round,
    date: api.date,
    time: api.time,
    result: api.result,
    notes: api.notes,
    interviewer: api.interviewer,
  };
}

function convertApiMockInterview(api: ApiMockInterview): LocalMockInterview {
  return {
    id: api.id,
    type: api.type,
    typeLabel: api.typeLabel,
    date: new Date(api.createdAt).toLocaleDateString("zh-CN"),
    overallScore: api.overallScore,
    maxScore: api.maxScore,
    questionCount: api.questionCount,
  };
}

export const syncService = {
  async syncAnswerRecordsFromApi(): Promise<Record<string, LocalAnswerRecord>> {
    if (!isAuthenticated()) return {};

    try {
      const records = await getAnswerRecords();
      const result: Record<string, LocalAnswerRecord> = {};
      for (const record of records) {
        result[record.questionId] = convertApiAnswerRecord(record);
      }
      return result;
    } catch (error) {
      console.error("Failed to sync answer records:", error);
      return {};
    }
  },

  async syncFavoritesFromApi(): Promise<Set<string>> {
    if (!isAuthenticated()) return new Set();

    try {
      const favorites = await getFavorites();
      return new Set(favorites.map((f) => f.questionId));
    } catch (error) {
      console.error("Failed to sync favorites:", error);
      return new Set();
    }
  },

  async syncJobsFromApi(): Promise<LocalJobApplication[]> {
    if (!isAuthenticated()) return [];

    try {
      const jobs = await getJobs();
      return jobs.map(convertApiJobApplication);
    } catch (error) {
      console.error("Failed to sync jobs:", error);
      return [];
    }
  },

  async syncInterviewsFromApi(): Promise<LocalInterviewRecord[]> {
    if (!isAuthenticated()) return [];

    try {
      const interviews = await getInterviews();
      return interviews.map(convertApiInterviewRecord);
    } catch (error) {
      console.error("Failed to sync interviews:", error);
      return [];
    }
  },

  async syncMockInterviewsFromApi(): Promise<LocalMockInterview[]> {
    if (!isAuthenticated()) return [];

    try {
      const interviews = await getMockInterviews();
      return interviews.map(convertApiMockInterview);
    } catch (error) {
      console.error("Failed to sync mock interviews:", error);
      return [];
    }
  },

  async saveAnswerRecord(questionId: string, status: QuestionStatus, note: string): Promise<void> {
    if (!isAuthenticated()) return;

    try {
      await upsertAnswerRecord({ questionId, status, note });
    } catch (error) {
      console.error("Failed to save answer record:", error);
    }
  },

  async toggleFavorite(questionId: string): Promise<boolean> {
    if (!isAuthenticated()) return false;

    try {
      return await apiToggleFavorite(questionId);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      return false;
    }
  },

  async saveJob(job: LocalJobApplication): Promise<void> {
    if (!isAuthenticated()) return;

    try {
      const existingJobs = await getJobs();
      const existingJob = existingJobs.find((j) => j.id === job.id);

      if (existingJob) {
        await updateJob(job.id, {
          companyName: job.companyName,
          position: job.position,
          status: job.status,
          salary: job.salary,
          location: job.location,
          jobUrl: job.jobUrl,
          notes: job.notes,
        });
      } else {
        await createJob({
          companyName: job.companyName,
          position: job.position,
          status: job.status,
          salary: job.salary,
          location: job.location,
          jobUrl: job.jobUrl,
          notes: job.notes,
          appliedDate: job.appliedDate,
        });
      }
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  },

  async removeJob(id: string): Promise<void> {
    if (!isAuthenticated()) return;

    try {
      await deleteJob(id);
    } catch (error) {
      console.error("Failed to remove job:", error);
    }
  },

  async saveInterview(interview: LocalInterviewRecord): Promise<void> {
    if (!isAuthenticated()) return;

    try {
      const existingInterviews = await getInterviews();
      const existingInterview = existingInterviews.find((i) => i.id === interview.id);

      if (existingInterview) {
        await updateInterview(interview.id, {
          round: interview.round,
          date: interview.date,
          time: interview.time,
          result: interview.result,
          notes: interview.notes,
          interviewer: interview.interviewer,
        });
      } else {
        await createInterview({
          jobId: interview.jobId,
          companyName: interview.companyName,
          position: interview.position,
          round: interview.round,
          date: interview.date,
          time: interview.time,
          result: interview.result,
          notes: interview.notes,
          interviewer: interview.interviewer,
        });
      }
    } catch (error) {
      console.error("Failed to save interview:", error);
    }
  },

  async removeInterview(id: string): Promise<void> {
    if (!isAuthenticated()) return;

    try {
      await deleteInterview(id);
    } catch (error) {
      console.error("Failed to remove interview:", error);
    }
  },

  async saveMockInterview(
    type: InterviewType,
    typeLabel: string,
    startTime: Date,
    endTime: Date,
    duration: number,
    overallScore: number,
    maxScore: number,
    questionCount: number,
    summary: string,
    suggestions: string[]
  ): Promise<void> {
    if (!isAuthenticated()) return;

    try {
      await createMockInterview({
        type,
        typeLabel,
        startTime,
        endTime,
        duration,
        overallScore,
        maxScore,
        questionCount,
        summary,
        suggestions,
      });
    } catch (error) {
      console.error("Failed to save mock interview:", error);
    }
  },
};
