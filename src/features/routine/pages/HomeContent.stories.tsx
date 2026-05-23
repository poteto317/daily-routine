import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { Routine } from "@/types/routine";
import type { HomeContentViewModel } from "./helpers";
import type { HomeDisplaySummary, HomeToolbarProps } from "./homeTypes";
import { HomeContent } from "./HomeContent";

// HomeContent は純粋な ViewModel props を受け取るプレゼンテーションコンポーネント。
// 内部の RoutineForm は showRoutineForm=true のときのみ表示される。

const routines: Routine[] = [
  {
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
  },
  {
    id: "r-2",
    title: "英語学習",
    startTime: "06:30",
    duration: 20,
    category: "study",
    daysOfWeek: [1, 2, 3, 4, 5],
    isCompleted: true,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
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
  sortedDaysAndHoliday: [
    { value: 1, label: "月曜日" },
    { value: 2, label: "火曜日" },
    { value: 3, label: "水曜日" },
    { value: 4, label: "木曜日" },
    { value: 5, label: "金曜日" },
    { value: 6, label: "土曜日" },
    { value: 0, label: "日曜日" },
    "holiday",
  ],
};

const baseDisplay: HomeDisplaySummary = {
  completedMinutes: 20,
  totalMinutes: 35,
  progressPercentage: 57,
};

const baseViewModel: HomeContentViewModel = {
  toolbarProps: {
    view: baseView,
    display: baseDisplay,
    trainDelays: [],
    onAddRoutineAction: fn(),
    showAddButton: true,
  },
  routineListProps: {
    sortedRoutines: routines,
    allRoutinesCount: routines.length,
    displayRoutinesCount: routines.length,
    isEditMode: false,
    viewMode: 6,
    onToggleAction: fn(),
    onEditAction: fn(),
    onDeleteAction: fn(),
    onAddRoutineAction: fn(),
    onReorderAction: fn(),
  },
  routineFormProps: {
    routine: undefined,
    onSubmitAction: fn(),
    onCancelAction: fn(),
    currentDayOfWeek: 6,
  },
  showRoutineForm: false,
};

const meta = {
  title: "Features/Routine/HomeContent",
  component: HomeContent,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HomeContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: baseViewModel,
};

export const EmptyState: Story = {
  args: {
    ...baseViewModel,
    routineListProps: {
      ...baseViewModel.routineListProps,
      sortedRoutines: [],
      allRoutinesCount: 0,
      displayRoutinesCount: 0,
    },
  },
};

export const EditMode: Story = {
  args: {
    ...baseViewModel,
    toolbarProps: {
      ...baseViewModel.toolbarProps,
      view: { ...baseView, isEditMode: true },
    },
    routineListProps: {
      ...baseViewModel.routineListProps,
      isEditMode: true,
    },
  },
};

export const WithForm: Story = {
  args: {
    ...baseViewModel,
    showRoutineForm: true,
  },
};
