import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CalendarGrid } from "./CalendarGrid";
import type { DailyHistory, PomodoroHistory } from "@/types/routine";

const meta = {
  title: "Features/Calendar/CalendarGrid",
  component: CalendarGrid,
  parameters: {
    layout: "padded",
  },
  args: {
    onDateClick: fn(),
  },
} satisfies Meta<typeof CalendarGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeHistory = (
  year: number,
  month: number,
  entries: { day: number; completed: number; total: number }[],
): Record<string, DailyHistory> => {
  const result: Record<string, DailyHistory> = {};
  for (const { day, completed, total } of entries) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    result[dateStr] = {
      date: dateStr,
      completedRoutineIds: Array.from({ length: completed }, (_, i) => `r-${i}`),
      routineSnapshots: Array.from({ length: total }, (_, i) => ({
        id: `r-${i}`,
        title: `ルーティン${i + 1}`,
        category: "health" as const,
        startTime: "07:00",
      })),
    };
  }
  return result;
};

const sampleHistory = makeHistory(2026, 5, [
  { day: 1, completed: 5, total: 5 },
  { day: 2, completed: 4, total: 5 },
  { day: 4, completed: 5, total: 5 },
  { day: 5, completed: 3, total: 5 },
  { day: 6, completed: 2, total: 5 },
  { day: 7, completed: 5, total: 5 },
  { day: 8, completed: 4, total: 5 },
  { day: 11, completed: 5, total: 5 },
  { day: 12, completed: 5, total: 5 },
  { day: 13, completed: 1, total: 5 },
  { day: 14, completed: 5, total: 5 },
  { day: 15, completed: 4, total: 5 },
  { day: 18, completed: 3, total: 5 },
  { day: 19, completed: 5, total: 5 },
  { day: 20, completed: 5, total: 5 },
]);

const samplePomodoro: PomodoroHistory = {
  "2026-05-07": { date: "2026-05-07", completedPomodoros: 4 },
  "2026-05-12": { date: "2026-05-12", completedPomodoros: 6 },
  "2026-05-19": { date: "2026-05-19", completedPomodoros: 3 },
};

export const CurrentMonth: Story = {
  args: {
    year: 2026,
    month: 5,
    monthHistory: sampleHistory,
    pomodoroHistory: samplePomodoro,
    selectedDate: "2026-05-21",
  },
};

export const NoHistory: Story = {
  args: {
    year: 2026,
    month: 5,
    monthHistory: {},
    pomodoroHistory: {},
    selectedDate: null,
  },
};

export const PreviousMonth: Story = {
  args: {
    year: 2026,
    month: 4,
    monthHistory: makeHistory(2026, 4, [
      { day: 1, completed: 5, total: 5 },
      { day: 3, completed: 4, total: 5 },
      { day: 7, completed: 5, total: 5 },
      { day: 14, completed: 3, total: 5 },
      { day: 21, completed: 5, total: 5 },
      { day: 28, completed: 4, total: 5 },
      { day: 30, completed: 5, total: 5 },
    ]),
    pomodoroHistory: {
      "2026-04-14": { date: "2026-04-14", completedPomodoros: 5 },
      "2026-04-21": { date: "2026-04-21", completedPomodoros: 8 },
    },
    selectedDate: null,
  },
};

export const AllCompleted: Story = {
  args: {
    year: 2026,
    month: 4,
    monthHistory: makeHistory(
      2026,
      4,
      Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        completed: 5,
        total: 5,
      })),
    ),
    pomodoroHistory: {},
    selectedDate: null,
  },
};
