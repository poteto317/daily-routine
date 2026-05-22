import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkTrackerTodaySummary } from "./WorkTrackerTodaySummary";

const meta = {
  title: "Features/WorkTracker/WorkTrackerTodaySummary",
  component: WorkTrackerTodaySummary,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof WorkTrackerTodaySummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSessions: Story = {
  args: { totalTime: 0, sessionsCount: 0 },
};

export const OneSession: Story = {
  args: { totalTime: 3600, sessionsCount: 1 },
};

export const MultipleSessions: Story = {
  args: { totalTime: 14400, sessionsCount: 3 },
};

export const LongDay: Story = {
  args: { totalTime: 28800, sessionsCount: 5 },
};
