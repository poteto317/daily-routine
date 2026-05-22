import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WeightTrackerHistoryItem } from "./WeightTrackerHistoryItem";
import type { WeightRecord } from "@/types/routine";

const meta = {
  title: "Features/WeightTracker/WeightTrackerHistoryItem",
  component: WeightTrackerHistoryItem,
  parameters: {
    layout: "padded",
  },
  args: {
    today: "2026-05-21",
    onDelete: fn(),
  },
} satisfies Meta<typeof WeightTrackerHistoryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseRecord: WeightRecord = {
  id: "wr-1",
  date: "2026-05-21",
  weight: 68.5,
  createdAt: "2026-05-21T07:00:00+09:00",
  updatedAt: "2026-05-21T07:00:00+09:00",
};

const prevRecord: WeightRecord = {
  id: "wr-0",
  date: "2026-05-20",
  weight: 68.8,
  createdAt: "2026-05-20T07:00:00+09:00",
  updatedAt: "2026-05-20T07:00:00+09:00",
};

export const TodayNoChange: Story = {
  args: { record: baseRecord, prevRecord: undefined },
};

export const TodayImproved: Story = {
  args: { record: baseRecord, prevRecord },
};

export const TodayIncreased: Story = {
  args: {
    record: { ...baseRecord, weight: 69.2 },
    prevRecord: { ...prevRecord, weight: 68.8 },
  },
};

export const PastDayWithNotes: Story = {
  args: {
    record: {
      ...baseRecord,
      date: "2026-05-18",
      weight: 68.3,
      notes: "朝食前に測定。前日比-0.5kg。",
    },
    prevRecord: { ...prevRecord, date: "2026-05-17", weight: 68.8 },
  },
};

export const ClickDelete: Story = {
  args: { record: baseRecord, prevRecord },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDelete).toHaveBeenCalledWith("2026-05-21");
  },
};
