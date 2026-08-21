import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WeeklyGoalsPanel } from "./WeeklyGoalsPanel";

const meta = {
  title: "Features/Statistics/WeeklyGoalsPanel",
  component: WeeklyGoalsPanel,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WeeklyGoalsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: {
    goals: [
      {
        goalId: "exercise",
        title: "運動",
        targetPerWeek: 3,
        completedCount: 2,
        remainingCount: 1,
        isAchieved: false,
        currentStreak: 4,
        longestStreak: 7,
      },
    ],
  },
};

export const Achieved: Story = {
  args: {
    goals: [
      {
        goalId: "reading",
        title: "読書",
        targetPerWeek: 5,
        completedCount: 5,
        remainingCount: 0,
        isAchieved: true,
        currentStreak: 8,
        longestStreak: 12,
      },
    ],
  },
};

export const Empty: Story = { args: { goals: [] } };
