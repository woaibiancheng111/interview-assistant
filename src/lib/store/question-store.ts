import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Question,
  type Difficulty,
  type Category,
  questions,
  categories,
} from "@/lib/data/questions";

export type QuestionStatus = "none" | "completed" | "review";

export interface AnswerRecord {
  questionId: string;
  status: QuestionStatus;
  note: string;
  updatedAt: number;
}

interface QuestionFilters {
  category: Category | "all";
  difficulty: Difficulty | "all";
  search: string;
  status: QuestionStatus | "all";
  tags: string[];
}

interface QuestionStats {
  total: number;
  completed: number;
  reviewing: number;
  easyCompleted: number;
  mediumCompleted: number;
  hardCompleted: number;
  categoryProgress: Record<Category, { total: number; completed: number }>;
}

interface QuestionStore {
  // 题目数据
  allQuestions: Question[];

  // 筛选条件
  filters: QuestionFilters;
  setCategory: (category: Category | "all") => void;
  setDifficulty: (difficulty: Difficulty | "all") => void;
  setSearch: (search: string) => void;
  setStatus: (status: QuestionStatus | "all") => void;
  setTags: (tags: string[]) => void;
  resetFilters: () => void;

  // 刷题进度
  answerRecords: Record<string, AnswerRecord>;
  favorites: Set<string>;
  markQuestion: (questionId: string, status: QuestionStatus, note?: string) => void;
  toggleFavorite: (questionId: string) => void;
  isFavorite: (questionId: string) => boolean;
  getQuestionStatus: (questionId: string) => QuestionStatus;

  // 筛选后的题目列表
  getFilteredQuestions: () => Question[];

  // 统计数据
  getStats: () => QuestionStats;

  // 所有标签
  getAllTags: () => string[];
}

const defaultFilters: QuestionFilters = {
  category: "all",
  difficulty: "all",
  search: "",
  status: "all",
  tags: [],
};

export const useQuestionStore = create<QuestionStore>()(
  persist(
    (set, get) => ({
      allQuestions: questions,

      filters: { ...defaultFilters },

      setCategory: (category) =>
        set((state) => ({
          filters: { ...state.filters, category },
        })),

      setDifficulty: (difficulty) =>
        set((state) => ({
          filters: { ...state.filters, difficulty },
        })),

      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
        })),

      setStatus: (status) =>
        set((state) => ({
          filters: { ...state.filters, status },
        })),

      setTags: (tags) =>
        set((state) => ({
          filters: { ...state.filters, tags },
        })),

      resetFilters: () =>
        set({
          filters: { ...defaultFilters },
        }),

      answerRecords: {},
      favorites: new Set<string>(),

      markQuestion: (questionId, status, note = "") =>
        set((state) => ({
          answerRecords: {
            ...state.answerRecords,
            [questionId]: {
              questionId,
              status,
              note,
              updatedAt: Date.now(),
            },
          },
        })),

      toggleFavorite: (questionId) =>
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(questionId)) {
            newFavorites.delete(questionId);
          } else {
            newFavorites.add(questionId);
          }
          return { favorites: newFavorites };
        }),

      isFavorite: (questionId) => get().favorites.has(questionId),

      getQuestionStatus: (questionId) => {
        const record = get().answerRecords[questionId];
        return record?.status ?? "none";
      },

      getFilteredQuestions: () => {
        const { allQuestions, filters, answerRecords } = get();

        return allQuestions.filter((q) => {
          // 分类筛选
          if (filters.category !== "all" && q.category !== filters.category) {
            return false;
          }

          // 难度筛选
          if (
            filters.difficulty !== "all" &&
            q.difficulty !== filters.difficulty
          ) {
            return false;
          }

          // 状态筛选
          if (filters.status !== "all") {
            const record = answerRecords[q.id];
            const currentStatus = record?.status ?? "none";
            if (filters.status === "none" && currentStatus !== "none") {
              return false;
            }
            if (
              filters.status !== "none" &&
              currentStatus !== filters.status
            ) {
              return false;
            }
          }

          // 搜索筛选
          if (filters.search) {
            const keyword = filters.search.toLowerCase();
            const matchTitle = q.title.toLowerCase().includes(keyword);
            const matchContent = q.content.toLowerCase().includes(keyword);
            const matchTags = q.tags.some((t) =>
              t.toLowerCase().includes(keyword)
            );
            if (!matchTitle && !matchContent && !matchTags) {
              return false;
            }
          }

          // 标签筛选
          if (filters.tags.length > 0) {
            const hasTag = filters.tags.some((tag) => q.tags.includes(tag));
            if (!hasTag) {
              return false;
            }
          }

          return true;
        });
      },

      getStats: () => {
        const { allQuestions, answerRecords } = get();
        let completed = 0;
        let reviewing = 0;
        let easyCompleted = 0;
        let mediumCompleted = 0;
        let hardCompleted = 0;

        const categoryProgress = {} as Record<
          Category,
          { total: number; completed: number }
        >;

        for (const cat of categories) {
          categoryProgress[cat] = { total: 0, completed: 0 };
        }

        for (const q of allQuestions) {
          categoryProgress[q.category].total += 1;

          const record = answerRecords[q.id];
          if (record) {
            if (record.status === "completed") {
              completed += 1;
              categoryProgress[q.category].completed += 1;
              if (q.difficulty === "easy") easyCompleted += 1;
              if (q.difficulty === "medium") mediumCompleted += 1;
              if (q.difficulty === "hard") hardCompleted += 1;
            } else if (record.status === "review") {
              reviewing += 1;
            }
          }
        }

        return {
          total: allQuestions.length,
          completed,
          reviewing,
          easyCompleted,
          mediumCompleted,
          hardCompleted,
          categoryProgress,
        };
      },

      getAllTags: () => {
        const { allQuestions } = get();
        const tagSet = new Set<string>();
        for (const q of allQuestions) {
          for (const tag of q.tags) {
            tagSet.add(tag);
          }
        }
        return Array.from(tagSet).sort();
      },
    }),
    {
      name: "question-store",
      partialize: (state) => ({
        answerRecords: state.answerRecords,
        favorites: Array.from(state.favorites),
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<QuestionStore> | undefined;
        if (!p) return current;
        return {
          ...current,
          answerRecords: (p.answerRecords ?? current.answerRecords) as Record<
            string,
            AnswerRecord
          >,
          favorites: new Set<string>(
            (p.favorites as string[] | Set<string>) ?? current.favorites
          ),
        };
      },
    }
  )
);
