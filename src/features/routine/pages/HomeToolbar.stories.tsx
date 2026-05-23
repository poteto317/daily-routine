import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { TrainDelayInfo } from "@/types/routine";
import type { HomeDisplaySummary, HomeToolbarProps } from "./homeTypes";
import { HomeToolbar } from "./HomeToolbar";

// HomeToolbar は純粋な props コンポーネント。localStorage / API 依存なし。

const sortedDaysAndHoliday: HomeToolbarProps["view"]["sortedDaysAndHoliday"] = [
  { value: 1, label: "月曜日" },
  { value: 2, label: "火曜日" },
  { value: 3, label: "水曜日" },
  { value: 4, label: "木曜日" },
  { value: 5, label: "金曜日" },
  { value: 6, label: "土曜日" },
  { value: 0, label: "日曜日" },
  "holiday",
];

const baseView: HomeToolbarProps["view"] = {
  currentDate: "2026年5月23日(土)",
  isTodayHoliday: false,
  isEditMode: false,
  toggleEditModeAction: fn(),
  viewMode: 6,
  setViewModeAction: fn(),
  filterCategory: "all",
  setFilterCategoryAction: fn(),
  sortedDaysAndHoliday,
};

const baseDisplay: HomeDisplaySummary = {
  completedMinutes: 30,
  totalMinutes: 90,
  progressPercentage: 33,
};

const trainDelay: TrainDelayInfo = {
  lineId: "jr-chuo",
  lineName: "中央線",
  company: "JR東日本",
  delayMinutes: 10,
  reason: "人身事故",
  section: "新宿〜立川",
  lastUpdated: "2026-05-23T08:30:00+09:00",
};

const meta = {
  title: "Features/Routine/HomeToolbar",
  component: HomeToolbar,
  parameters: { layout: "padded" },
  args: {
    view: baseView,
    display: baseDisplay,
    trainDelays: [],
    onAddRoutineAction: fn(),
    showAddButton: true,
  },
} satisfies Meta<typeof HomeToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HolidayMode: Story = {
  args: {
    view: {
      ...baseView,
      isTodayHoliday: true,
      viewMode: "holiday",
    },
  },
};

export const WithTrainDelay: Story = {
  args: { trainDelays: [trainDelay] },
};

export const AllCompleted: Story = {
  args: {
    display: { completedMinutes: 90, totalMinutes: 90, progressPercentage: 100 },
  },
};

export const NoAddButton: Story = {
  args: { showAddButton: false },
};

export const CategoryFiltered: Story = {
  args: {
    view: { ...baseView, filterCategory: "health" },
  },
};
