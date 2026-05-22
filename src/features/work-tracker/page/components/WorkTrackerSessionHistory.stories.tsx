import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { WorkTrackerSessionHistory } from "./WorkTrackerSessionHistory";
import type { WorkSession } from "@/types/routine";

const meta = {
  title: "Features/WorkTracker/WorkTrackerSessionHistory",
  component: WorkTrackerSessionHistory,
  parameters: {
    layout: "padded",
  },
  args: {
    onDeleteSession: fn(),
  },
} satisfies Meta<typeof WorkTrackerSessionHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

const sessions: WorkSession[] = [
  {
    id: "s-1",
    workTemplateId: "tmpl-1",
    workName: "機能開発",
    mood: "good",
    startTime: "2026-05-22T09:00:00+09:00",
    endTime: "2026-05-22T11:30:00+09:00",
    duration: 9000,
    createdAt: "2026-05-22T09:00:00+09:00",
  },
  {
    id: "s-2",
    workTemplateId: "tmpl-2",
    workName: "コードレビュー",
    mood: "great",
    startTime: "2026-05-22T13:00:00+09:00",
    endTime: "2026-05-22T14:00:00+09:00",
    duration: 3600,
    notes: "重要な修正点を2件指摘。",
    createdAt: "2026-05-22T13:00:00+09:00",
  },
  {
    id: "s-3",
    workTemplateId: "tmpl-3",
    workName: "バグ修正",
    mood: "tired",
    startTime: "2026-05-22T15:00:00+09:00",
    endTime: "2026-05-22T17:30:00+09:00",
    duration: 9000,
    createdAt: "2026-05-22T15:00:00+09:00",
  },
];

export const Empty: Story = {
  args: { sessions: [] },
};

export const SingleSession: Story = {
  args: { sessions: [sessions[0]] },
};

export const MultipleSessions: Story = {
  args: { sessions },
};
