import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RoutineCardContent } from "./RoutineCardContent";
import type { Routine } from "@/types/routine";

const meta = {
  title: "Features/Routine/RoutineCardContent",
  component: RoutineCardContent,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof RoutineCardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseRoutine: Routine = {
  id: "routine-1",
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

export const HealthCategory: Story = {
  args: { routine: baseRoutine },
};

export const WorkCategory: Story = {
  args: {
    routine: {
      ...baseRoutine,
      title: "メール確認・返信",
      startTime: "09:00",
      category: "work",
    },
  },
};

export const HobbyCategory: Story = {
  args: {
    routine: {
      ...baseRoutine,
      title: "ギター練習",
      startTime: "20:00",
      duration: 30,
      category: "hobby",
    },
  },
};

export const StudyCategory: Story = {
  args: {
    routine: {
      ...baseRoutine,
      title: "英語学習（Duolingo）",
      startTime: "06:30",
      duration: 20,
      category: "study",
    },
  },
};

export const LifeCategory: Story = {
  args: {
    routine: {
      ...baseRoutine,
      title: "洗濯・掃除",
      startTime: "08:30",
      duration: 30,
      category: "life",
    },
  },
};

export const Completed: Story = {
  args: {
    routine: {
      ...baseRoutine,
      isCompleted: true,
    },
  },
};

export const WithDescription: Story = {
  args: {
    routine: {
      ...baseRoutine,
      title: "瞑想",
      category: "health",
      description:
        "呼吸に集中する。雑念が浮かんでも気づいたら戻す。10分でも効果あり。",
    },
  },
};

export const WithNotification: Story = {
  args: {
    routine: {
      ...baseRoutine,
      title: "服薬",
      startTime: "08:00",
      category: "health",
      notificationMinutes: 5,
    },
  },
};

export const WithWeeklyGoal: Story = {
  args: {
    routine: {
      ...baseRoutine,
      weeklyGoal: {
        targetPerWeek: 3,
        startedAt: "2026-08-22T00:00:00+09:00",
      },
    },
  },
};

export const ShowDuration: Story = {
  args: {
    routine: {
      ...baseRoutine,
      title: "ランニング",
      startTime: "06:00",
      duration: 30,
      category: "health",
      notificationMinutes: 10,
    },
    showDuration: true,
  },
};

export const LongTitle: Story = {
  args: {
    routine: {
      ...baseRoutine,
      title:
        "今日やるべきことをすべてリストアップして優先順位をつける朝の計画タイム",
      startTime: "07:30",
      category: "work",
    },
  },
};
