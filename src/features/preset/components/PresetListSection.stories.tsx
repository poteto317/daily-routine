import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { PresetListSection } from "./PresetListSection";
import type { RoutinePreset } from "@/types/routine";

const meta = {
  title: "Features/Preset/PresetListSection",
  component: PresetListSection,
  parameters: { layout: "padded" },
  args: {
    selectedDays: new Set<number>(),
    editRoutines: [],
    editPresetName: "",
    editPresetDescription: "",
    editSelectedRoutines: new Set<string>(),
    editingPresetId: null,
    onSelectPreset: fn(),
    onDeletePreset: fn(),
    onToggleDay: fn(),
    onApplyPreset: fn(),
    onStartEdit: fn(),
    onCancelEdit: fn(),
    onSaveEdit: fn(),
    onChangeEditName: fn(),
    onChangeEditDescription: fn(),
    onToggleEditRoutine: fn(),
  },
} satisfies Meta<typeof PresetListSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const presets: RoutinePreset[] = [
  {
    id: "p-1",
    name: "朝の健康ルーティン",
    description: "ストレッチ・瞑想・ランニングをまとめたプリセット",
    routineTemplates: [
      { title: "ストレッチ",  startTime: "06:00", duration: 10, category: "health" },
      { title: "瞑想",       startTime: "06:15", duration: 10, category: "health" },
      { title: "ランニング",  startTime: "06:30", duration: 30, category: "health" },
    ],
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
  {
    id: "p-2",
    name: "勉強セット",
    routineTemplates: [
      { title: "英語学習", startTime: "07:00", duration: 20, category: "study" },
      { title: "読書",     startTime: "22:00", duration: 30, category: "hobby" },
    ],
    createdAt: "2026-02-01T00:00:00+09:00",
    updatedAt: "2026-02-01T00:00:00+09:00",
  },
];

export const WithPresets: Story = {
  args: { presets, selectedPresetId: null },
};

export const Empty: Story = {
  args: { presets: [], selectedPresetId: null },
};

export const Selected: Story = {
  args: {
    presets,
    selectedPresetId: "p-1",
    selectedDays: new Set([1, 2, 3, 4, 5]),
  },
};
