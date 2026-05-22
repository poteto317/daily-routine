import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarDetailPanel } from "./CalendarDetailPanel";
import type { DailyHistory } from "@/types/routine";

const meta = {
  title: "Features/Calendar/CalendarDetailPanel",
  component: CalendarDetailPanel,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CalendarDetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const snapshots = [
  { id: "r-1", title: "朝のストレッチ", category: "health" as const, startTime: "07:00" },
  { id: "r-2", title: "メール確認", category: "work" as const, startTime: "09:00" },
  { id: "r-3", title: "英語学習", category: "study" as const, startTime: "06:30" },
  { id: "r-4", title: "ランニング", category: "health" as const, startTime: "06:00" },
  { id: "r-5", title: "読書", category: "hobby" as const, startTime: "22:00" },
];

export const NoDateSelected: Story = {
  args: { selectedDate: null, selectedHistory: null },
};

export const NoHistoryForDate: Story = {
  args: { selectedDate: "2026-05-22", selectedHistory: null },
};

export const FullCompletion: Story = {
  args: {
    selectedDate: "2026-05-22",
    selectedHistory: {
      date: "2026-05-22",
      completedRoutineIds: snapshots.map((s) => s.id),
      routineSnapshots: snapshots,
    } satisfies DailyHistory,
  },
};

export const PartialCompletion: Story = {
  args: {
    selectedDate: "2026-05-22",
    selectedHistory: {
      date: "2026-05-22",
      completedRoutineIds: ["r-1", "r-2"],
      routineSnapshots: snapshots,
    } satisfies DailyHistory,
  },
};

export const NoCompletion: Story = {
  args: {
    selectedDate: "2026-05-22",
    selectedHistory: {
      date: "2026-05-22",
      completedRoutineIds: [],
      routineSnapshots: snapshots,
    } satisfies DailyHistory,
  },
};
