import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { Routine } from "@/types/routine";
import { DraggableRoutineList } from "./DraggableRoutineList";

// DraggableRoutineList は自身が DndContext を内包するため、外部の DnD ラッパーは不要。
// 内部で SortableRoutineItem → SortableRoutineEditModeItem → getSettings() を呼ぶため
// localStorage が空でも DEFAULT_SETTINGS でレンダリング可能。

const meta = {
  title: "Features/Routine/DraggableRoutineList",
  component: DraggableRoutineList,
  parameters: { layout: "padded" },
  args: {
    onToggleAction: fn(),
    onEditAction: fn(),
    onDeleteAction: fn(),
    onReorderAction: fn(),
  },
} satisfies Meta<typeof DraggableRoutineList>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const ViewMode: Story = {
  args: { routines, isEditMode: false },
};

export const EditMode: Story = {
  args: { routines, isEditMode: true },
};

export const Empty: Story = {
  args: { routines: [], isEditMode: false },
};

export const SingleItem: Story = {
  args: { routines: [routines[0]], isEditMode: false },
};

export const AllCompleted: Story = {
  args: {
    routines: routines.map((r) => ({ ...r, isCompleted: true })),
    isEditMode: false,
  },
};
