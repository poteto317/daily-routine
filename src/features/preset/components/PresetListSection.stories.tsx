import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PresetListSection } from "./PresetListSection";
import type { RoutinePreset } from "@/types/routine";

const meta = {
  title: "Features/Preset/PresetListSection",
  component: PresetListSection,
  parameters: { layout: "padded" },
  args: {
    editRoutines: [],
    editPresetName: "",
    editPresetDescription: "",
    editingPresetId: null,
    onSelectPreset: fn(),
    onDeletePreset: fn(),
    onDuplicatePreset: fn(),
    onToggleDay: fn(),
    onApplyPreset: fn(),
    onStartEdit: fn(),
    onCancelEdit: fn(),
    onSaveEdit: fn(),
    onChangeEditName: fn(),
    onChangeEditDescription: fn(),
    onToggleEditRoutine: fn(),
  },
  argTypes: {
    selectedDays: { control: false },
    editSelectedRoutines: { control: false },
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
  args: { presets, selectedPresetId: null, selectedDays: new Set<number>(), editSelectedRoutines: new Set<string>() },
};

export const Empty: Story = {
  args: { presets: [], selectedPresetId: null, selectedDays: new Set<number>(), editSelectedRoutines: new Set<string>() },
};

export const Selected: Story = {
  args: {
    presets,
    selectedPresetId: "p-1",
    selectedDays: new Set([1, 2, 3, 4, 5]),
    editSelectedRoutines: new Set<string>(),
  },
};

/** プリセットカードをクリック → onSelectPreset が呼ばれる */
export const ClickSelect: Story = {
  args: { presets, selectedPresetId: null, selectedDays: new Set<number>(), editSelectedRoutines: new Set<string>() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText("朝の健康ルーティン");
    await userEvent.click(card);
    expect(args.onSelectPreset).toHaveBeenCalledWith("p-1");
  },
};

/** 削除ボタンをクリック → onDeletePreset が呼ばれる */
export const ClickDelete: Story = {
  args: { presets, selectedPresetId: null, selectedDays: new Set<number>(), editSelectedRoutines: new Set<string>() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: "プリセットを削除" });
    await userEvent.click(deleteButton);
    expect(args.onDeletePreset).toHaveBeenCalledWith("p-1");
  },
};
