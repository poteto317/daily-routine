import { fireEvent, render, screen } from "@testing-library/react";
import * as holidays from "@/lib/holidays";
import * as pomodoroStorage from "@/features/pomodoro/storage";
import * as routineStorage from "@/features/routine/storage";
import { DailyHistory } from "@/types/routine";
import { AchievementCalendar } from "../AchievementCalendar";

jest.mock("@/features/routine/storage", () => ({
  getHistoryForMonth: jest.fn(),
  getDailyHistory: jest.fn(),
}));

jest.mock("@/features/pomodoro/storage", () => ({
  getPomodoroHistory: jest.fn(),
}));

jest.mock("@/lib/holidays", () => ({
  isHoliday: jest.fn(),
}));

export const mockGetHistoryForMonth =
  routineStorage.getHistoryForMonth as jest.Mock;
export const mockGetDailyHistory = routineStorage.getDailyHistory as jest.Mock;
export const mockGetPomodoroHistory =
  pomodoroStorage.getPomodoroHistory as jest.Mock;
export const mockIsHoliday = holidays.isHoliday as jest.Mock;

export const setupCalendarTest = () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHistoryForMonth.mockReturnValue({});
    mockGetPomodoroHistory.mockReturnValue({});
    mockIsHoliday.mockReturnValue(false);
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-15"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });
};

export const renderCalendar = () => render(<AchievementCalendar />);

export const clickPrevMonth = () => {
  const prev = screen
    .getAllByRole("button")
    .find((btn) => btn.querySelector('svg path[d="M15 19l-7-7 7-7"]'));
  fireEvent.click(prev!);
};

export const clickNextMonth = () => {
  const next = screen
    .getAllByRole("button")
    .find((btn) => btn.querySelector('svg path[d="M9 5l7 7-7 7"]'));
  fireEvent.click(next!);
};

export const sampleHistory = (
  overrides?: Partial<DailyHistory>,
): DailyHistory => ({
  date: "2024-06-10",
  completedRoutineIds: ["1"],
  routineSnapshots: [
    { id: "1", title: "Task 1", startTime: "09:00", category: "health" },
    { id: "2", title: "Task 2", startTime: "10:00", category: "work" },
  ],
  ...overrides,
});
