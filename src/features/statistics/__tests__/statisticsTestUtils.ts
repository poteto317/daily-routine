import { DailyHistory } from "@/types/routine";

jest.mock("@/features/routine/storage", () => ({
  getMonthlyHistory: jest.fn(),
  getHistoryForMonth: jest.fn(),
}));

import {
  getHistoryForMonth,
  getMonthlyHistory,
} from "@/features/routine/storage";

export const mockGetMonthlyHistory = getMonthlyHistory as jest.Mock;
export const mockGetHistoryForMonth = getHistoryForMonth as jest.Mock;

export const createHistory = (
  overrides: Partial<DailyHistory>,
): DailyHistory => ({
  date: "2024-01-15",
  completedRoutineIds: [],
  routineSnapshots: [],
  ...overrides,
});
