import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkTrackerSessionHistoryItem } from "./WorkTrackerSessionHistoryItem";
import type { WorkSession } from "@/types/routine";

const meta = {
  title: "Features/WorkTracker/WorkTrackerSessionHistoryItem",
  component: WorkTrackerSessionHistoryItem,
  parameters: {
    layout: "padded",
  },
  args: {
    onDeleteSession: fn(),
  },
} satisfies Meta<typeof WorkTrackerSessionHistoryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseSession: WorkSession = {
  id: "session-1",
  workTemplateId: "tmpl-1",
  workName: "機能開発",
  mood: "good",
  startTime: "2026-05-21T09:00:00+09:00",
  endTime: "2026-05-21T11:30:00+09:00",
  duration: 9000,
  createdAt: "2026-05-21T09:00:00+09:00",
};

export const Default: Story = {
  args: { session: baseSession },
};

export const WithNotes: Story = {
  args: {
    session: {
      ...baseSession,
      notes: "集中できた。認証フローの実装を完了。次回はテストを書く。",
    },
  },
};

export const GreatMood: Story = {
  args: {
    session: {
      ...baseSession,
      workName: "コードレビュー",
      mood: "great",
      duration: 3600,
      endTime: "2026-05-21T10:00:00+09:00",
    },
  },
};

export const TiredMood: Story = {
  args: {
    session: {
      ...baseSession,
      workName: "バグ修正",
      mood: "tired",
      duration: 14400,
      endTime: "2026-05-21T13:00:00+09:00",
      notes: "難しいバグで時間がかかった。",
    },
  },
};

export const StressedMood: Story = {
  args: {
    session: {
      ...baseSession,
      workName: "緊急対応",
      mood: "stressed",
      duration: 7200,
      endTime: "2026-05-21T11:00:00+09:00",
    },
  },
};

export const ClickDelete: Story = {
  args: { session: baseSession },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDeleteSession).toHaveBeenCalledWith("session-1");
  },
};
