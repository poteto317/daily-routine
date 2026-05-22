import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { PresetCreateSection } from "./PresetCreateSection";
import type { Routine } from "@/types/routine";

const meta = {
  title: "Features/Preset/PresetCreateSection",
  component: PresetCreateSection,
  parameters: {
    layout: "padded",
  },
  args: {
    onToggleCreating: fn(),
    onChangeName: fn(),
    onChangeDescription: fn(),
    onToggleRoutine: fn(),
    onToggleCreateFilterDay: fn(),
    onCreatePreset: fn(),
  },
  argTypes: {
    selectedRoutines: { control: false },
    createFilterDays: { control: false },
  },
} satisfies Meta<typeof PresetCreateSection>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    isCompleted: false,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
  {
    id: "r-3",
    title: "ランニング",
    startTime: "06:00",
    duration: 30,
    category: "health",
    daysOfWeek: [6, 0],
    isCompleted: false,
    sortOrder: 2,
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
];

export const Collapsed: Story = {
  args: {
    isCreating: false,
    currentRoutines: routines,
    newPresetName: "",
    newPresetDescription: "",
    selectedRoutines: new Set<string>(),
    createFilterDays: new Set<number>(),
  },
};

export const OpenEmpty: Story = {
  args: {
    isCreating: true,
    currentRoutines: routines,
    newPresetName: "",
    newPresetDescription: "",
    selectedRoutines: new Set<string>(),
    createFilterDays: new Set<number>(),
  },
};

export const OpenWithSelections: Story = {
  args: {
    isCreating: true,
    currentRoutines: routines,
    newPresetName: "朝のルーティン",
    newPresetDescription: "毎朝の基本セット",
    selectedRoutines: new Set(["r-1", "r-2"]),
    createFilterDays: new Set([1, 2, 3, 4, 5]),
  },
};

export const NoRoutines: Story = {
  args: {
    isCreating: true,
    currentRoutines: [],
    newPresetName: "",
    newPresetDescription: "",
    selectedRoutines: new Set<string>(),
    createFilterDays: new Set<number>(),
  },
};
