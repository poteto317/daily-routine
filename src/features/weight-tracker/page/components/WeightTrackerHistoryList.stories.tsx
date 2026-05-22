import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { WeightTrackerHistoryList } from "./WeightTrackerHistoryList";
import type { WeightRecord } from "@/types/routine";

const meta = {
  title: "Features/WeightTracker/WeightTrackerHistoryList",
  component: WeightTrackerHistoryList,
  parameters: {
    layout: "padded",
  },
  args: {
    today: "2026-05-22",
    onDeleteRecord: fn(),
  },
} satisfies Meta<typeof WeightTrackerHistoryList>;

export default meta;
type Story = StoryObj<typeof meta>;

const records: WeightRecord[] = [
  {
    id: "wr-1",
    date: "2026-05-22",
    weight: 68.5,
    createdAt: "2026-05-22T07:00:00+09:00",
    updatedAt: "2026-05-22T07:00:00+09:00",
  },
  {
    id: "wr-2",
    date: "2026-05-21",
    weight: 68.8,
    notes: "朝食前に測定。",
    createdAt: "2026-05-21T07:00:00+09:00",
    updatedAt: "2026-05-21T07:00:00+09:00",
  },
  {
    id: "wr-3",
    date: "2026-05-20",
    weight: 69.1,
    createdAt: "2026-05-20T07:00:00+09:00",
    updatedAt: "2026-05-20T07:00:00+09:00",
  },
  {
    id: "wr-4",
    date: "2026-05-19",
    weight: 68.9,
    createdAt: "2026-05-19T07:00:00+09:00",
    updatedAt: "2026-05-19T07:00:00+09:00",
  },
  {
    id: "wr-5",
    date: "2026-05-18",
    weight: 69.3,
    createdAt: "2026-05-18T07:00:00+09:00",
    updatedAt: "2026-05-18T07:00:00+09:00",
  },
];

export const Empty: Story = {
  args: { recentRecords: [] },
};

export const OneRecord: Story = {
  args: { recentRecords: [records[0]] },
};

export const FiveRecords: Story = {
  args: { recentRecords: records },
};

export const DownwardTrend: Story = {
  args: {
    recentRecords: records.map((r, i) => ({
      ...r,
      weight: 70.0 - i * 0.3,
    })),
  },
};
