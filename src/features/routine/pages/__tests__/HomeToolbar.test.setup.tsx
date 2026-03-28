import type { ReactNode } from "react";
import type { TrainDelayInfo } from "@/types/routine";
import type { HomeToolbarProps } from "../homeTypes";

type ProgressBarMockProps = {
  completedMinutes: number;
  totalMinutes: number;
  progressPercentage: number;
};

type TrainDelayNotificationMockProps = { delays: TrainDelayInfo[] };
type DaySelectorMockProps = { viewMode: "holiday" | number };
type CategoryFilterMockProps = { filterCategory: string };

jest.mock("@/components", () => ({
  CardPanel: ({ children }: { children: ReactNode }) => (
    <div data-testid="card-panel">{children}</div>
  ),
  ProgressBar: ({
    completedMinutes,
    totalMinutes,
    progressPercentage,
  }: ProgressBarMockProps) => (
    <div data-testid="progress-bar">
      {completedMinutes}/{totalMinutes}/{progressPercentage}
    </div>
  ),
}));

jest.mock("@/components/TrainDelayNotification", () => ({
  TrainDelayNotification: ({ delays }: TrainDelayNotificationMockProps) => (
    <div data-testid="train-delay">{delays.length}</div>
  ),
}));

jest.mock("../DaySelector", () => ({
  DaySelector: ({ viewMode }: DaySelectorMockProps) => (
    <div data-testid="day-selector">{String(viewMode)}</div>
  ),
}));

jest.mock("../CategoryFilter", () => ({
  CategoryFilter: ({ filterCategory }: CategoryFilterMockProps) => (
    <div data-testid="category-filter">{String(filterCategory)}</div>
  ),
}));

export const baseView: HomeToolbarProps["view"] = {
  currentDate: "2026年2月12日(木)",
  isTodayHoliday: false,
  isEditMode: true,
  toggleEditModeAction: jest.fn(),
  viewMode: 1,
  setViewModeAction: jest.fn(),
  filterCategory: "all",
  setFilterCategoryAction: jest.fn(),
  sortedDaysAndHoliday: [{ value: 1, label: "月曜日" }, "holiday"],
};
