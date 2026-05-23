import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { Routine } from "@/types/routine";
import { RoutineList } from "./RoutineList";

// RoutineList は props のみ。DnD コンテキストは DraggableRoutineList が内包するため decorator 不要。

const routines: Routine[] = [
  {
    id: "r-1",
    title: "朝のストレッチ",
    startTime: "07:00",
    duration: 15,
    category: "health",
    daysOfWeek: [1, 2, 3, 4, 5],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
  {
    id: "r-2",
    title: "英語学習",
    startTime: "06:30",
    duration: 20,
    category: "study",
    daysOfWeek: [1, 2, 3, 4, 5],
    isCompleted: true,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
  {
    id: "r-3",
    title: "ランニング",
    startTime: "06:00",
    duration: 30,
    category: "health",
    daysOfWeek: [6, 0],
    isCompleted: false,
    sortOrder: 2,
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
];

const meta = {
  title: "Features/Routine/RoutineList",
  component: RoutineList,
  parameters: { layout: "padded" },
  args: {
    sortedRoutines: routines,
    allRoutinesCount: routines.length,
    displayRoutinesCount: routines.length,
    isEditMode: false,
    viewMode: 1,
    onToggleAction: fn(),
    onEditAction: fn(),
    onDeleteAction: fn(),
    onAddRoutineAction: fn(),
    onReorderAction: fn(),
  },
} satisfies Meta<typeof RoutineList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ViewMode: Story = {};

export const EditMode: Story = {
  args: { isEditMode: true },
};

export const Empty: Story = {
  args: {
    sortedRoutines: [],
    allRoutinesCount: 0,
    displayRoutinesCount: 0,
  },
};

export const NoRoutinesForDay: Story = {
  args: {
    sortedRoutines: [],
    allRoutinesCount: 3,
    displayRoutinesCount: 0,
    viewMode: 6,
  },
};

export const FilteredEmpty: Story = {
  args: {
    sortedRoutines: [],
    allRoutinesCount: 3,
    displayRoutinesCount: 3,
  },
};

export const AllCompleted: Story = {
  args: {
    sortedRoutines: routines.map((r) => ({ ...r, isCompleted: true })),
  },
};
