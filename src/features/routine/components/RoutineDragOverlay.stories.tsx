import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Routine } from "@/types/routine";
import { RoutineDragOverlay } from "./RoutineDragOverlay";

const meta = {
  title: "Features/Routine/RoutineDragOverlay",
  component: RoutineDragOverlay,
  parameters: { layout: "padded" },
} satisfies Meta<typeof RoutineDragOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

const routine: Routine = {
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
};

const completedRoutine: Routine = {
  ...routine,
  id: "r-2",
  title: "英語学習",
  startTime: "06:30",
  duration: 20,
  category: "study",
  isCompleted: true,
};

export const Default: Story = {
  args: { routine },
};

export const Completed: Story = {
  args: { routine: completedRoutine },
};

export const NoRoutine: Story = {
  args: { routine: null },
};

export const LongTitle: Story = {
  args: {
    routine: {
      ...routine,
      title:
        "とても長いタイトルのルーティンがドラッグ中に表示される場合の確認用",
    },
  },
};
