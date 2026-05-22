import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { WeightTrackerTodayCard } from "./WeightTrackerTodayCard";

const meta = {
  title: "Features/WeightTracker/WeightTrackerTodayCard",
  component: WeightTrackerTodayCard,
  parameters: {
    layout: "padded",
  },
  args: {
    today: "2026-05-21",
    onEdit: fn(),
    onWeightChange: fn(),
    onNotesChange: fn(),
    onSave: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof WeightTrackerTodayCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoRecord: Story = {
  args: {
    todayRecord: null,
    showForm: false,
    weightInput: "",
    notesInput: "",
  },
};

export const ShowingForm: Story = {
  args: {
    todayRecord: null,
    showForm: true,
    weightInput: "",
    notesInput: "",
  },
};

export const WithRecord: Story = {
  args: {
    todayRecord: {
      id: "wr-1",
      date: "2026-05-21",
      weight: 68.5,
      createdAt: "2026-05-21T07:15:00+09:00",
      updatedAt: "2026-05-21T07:15:00+09:00",
    },
    showForm: false,
    weightInput: "68.5",
    notesInput: "",
  },
};

export const WithRecordAndNotes: Story = {
  args: {
    todayRecord: {
      id: "wr-1",
      date: "2026-05-21",
      weight: 68.2,
      notes: "朝食前。昨日より0.3kg減。体調良好。",
      createdAt: "2026-05-21T06:50:00+09:00",
      updatedAt: "2026-05-21T06:50:00+09:00",
    },
    showForm: false,
    weightInput: "68.2",
    notesInput: "朝食前。昨日より0.3kg減。体調良好。",
  },
};

export const EditingRecord: Story = {
  args: {
    todayRecord: {
      id: "wr-1",
      date: "2026-05-21",
      weight: 68.5,
      createdAt: "2026-05-21T07:15:00+09:00",
      updatedAt: "2026-05-21T07:15:00+09:00",
    },
    showForm: true,
    weightInput: "68.5",
    notesInput: "",
  },
};
