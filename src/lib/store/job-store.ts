import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncService } from "./sync-service";
import {
  JobStatus as PrismaJobStatus,
  InterviewResult as PrismaInterviewResult,
} from "@prisma/client";

// ==================== 类型定义 ====================

export type JobStatus = "applied" | "interviewing" | "offered" | "rejected";

export interface JobApplication {
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

export type InterviewResult = "pending" | "passed" | "failed" | "cancelled";

export interface InterviewRecord {
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

export interface JobStatistics {
  totalApplied: number;
  totalInterviewing: number;
  totalOffered: number;
  totalRejected: number;
  offerRate: number;
  interviewRate: number;
}

export interface JobState {
  // 数据
  jobList: JobApplication[];
  interviewRecords: InterviewRecord[];

  // 岗位操作
  addJob: (job: Omit<JobApplication, "id" | "lastUpdated">) => void;
  updateJob: (id: string, job: Partial<JobApplication>) => void;
  removeJob: (id: string) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;

  // 面试操作
  addInterview: (interview: Omit<InterviewRecord, "id">) => void;
  updateInterview: (id: string, interview: Partial<InterviewRecord>) => void;
  removeInterview: (id: string) => void;

  // 同步方法
  setJobList: (jobs: JobApplication[]) => void;
  setInterviewRecords: (interviews: InterviewRecord[]) => void;

  // 统计
  getStatistics: () => JobStatistics;

  // 搜索和筛选
  searchJobs: (query: string) => JobApplication[];
  filterJobsByStatus: (status: JobStatus) => JobApplication[];

  // 重置
  resetJobs: () => void;
}

// ==================== 工具函数 ====================

const generateId = () => Math.random().toString(36).substring(2, 11);

const getNow = () => new Date().toISOString().split("T")[0];

// ==================== Store ====================

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobList: [],
      interviewRecords: [],

      // 同步方法
      setJobList: (jobs) => set({ jobList: jobs }),
      setInterviewRecords: (interviews) => set({ interviewRecords: interviews }),

      // 岗位操作
      addJob: (job) => {
        const newJob: JobApplication = {
          ...job,
          id: generateId(),
          lastUpdated: getNow(),
        };
        set((state) => ({
          jobList: [...state.jobList, newJob],
        }));
        syncService.saveJob(newJob);
      },

      updateJob: (id, job) => {
        set((state) => ({
          jobList: state.jobList.map((j) =>
            j.id === id ? { ...j, ...job, lastUpdated: getNow() } : j
          ),
        }));
        const updatedJob = get().jobList.find((j) => j.id === id);
        if (updatedJob) {
          syncService.saveJob(updatedJob);
        }
      },

      removeJob: (id) => {
        set((state) => ({
          jobList: state.jobList.filter((j) => j.id !== id),
          interviewRecords: state.interviewRecords.filter((i) => i.jobId !== id),
        }));
        syncService.removeJob(id);
      },

      updateJobStatus: (id, status) => {
        set((state) => ({
          jobList: state.jobList.map((j) =>
            j.id === id ? { ...j, status, lastUpdated: getNow() } : j
          ),
        }));
        const updatedJob = get().jobList.find((j) => j.id === id);
        if (updatedJob) {
          syncService.saveJob(updatedJob);
        }
      },

      // 面试操作
      addInterview: (interview) => {
        const newInterview: InterviewRecord = {
          ...interview,
          id: generateId(),
        };
        set((state) => ({
          interviewRecords: [...state.interviewRecords, newInterview],
        }));
        syncService.saveInterview(newInterview);
      },

      updateInterview: (id, interview) => {
        set((state) => ({
          interviewRecords: state.interviewRecords.map((i) =>
            i.id === id ? { ...i, ...interview } : i
          ),
        }));
        const updatedInterview = get().interviewRecords.find((i) => i.id === id);
        if (updatedInterview) {
          syncService.saveInterview(updatedInterview);
        }
      },

      removeInterview: (id) => {
        set((state) => ({
          interviewRecords: state.interviewRecords.filter((i) => i.id !== id),
        }));
        syncService.removeInterview(id);
      },

      // 统计
      getStatistics: () => {
        const { jobList } = get();
        const totalApplied = jobList.length;
        const totalInterviewing = jobList.filter(
          (j) => j.status === "interviewing"
        ).length;
        const totalOffered = jobList.filter(
          (j) => j.status === "offered"
        ).length;
        const totalRejected = jobList.filter(
          (j) => j.status === "rejected"
        ).length;

        return {
          totalApplied,
          totalInterviewing,
          totalOffered,
          totalRejected,
          offerRate:
            totalApplied > 0
              ? Math.round((totalOffered / totalApplied) * 100)
              : 0,
          interviewRate:
            totalApplied > 0
              ? Math.round(
                  ((totalInterviewing + totalOffered + totalRejected) /
                    totalApplied) *
                    100
                )
              : 0,
        };
      },

      // 搜索
      searchJobs: (query) => {
        const { jobList } = get();
        const lowerQuery = query.toLowerCase();
        return jobList.filter(
          (j) =>
            j.companyName.toLowerCase().includes(lowerQuery) ||
            j.position.toLowerCase().includes(lowerQuery) ||
            j.location.toLowerCase().includes(lowerQuery) ||
            j.notes.toLowerCase().includes(lowerQuery)
        );
      },

      // 筛选
      filterJobsByStatus: (status) => {
        const { jobList } = get();
        return jobList.filter((j) => j.status === status);
      },

      // 重置
      resetJobs: () =>
        set({
          jobList: [],
          interviewRecords: [],
        }),
    }),
    {
      name: "job-storage",
    }
  )
);
