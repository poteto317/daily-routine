import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PresetCard } from "./PresetCard";
import type { RoutinePreset } from "@/types/routine";

const meta = {
  title: "Features/Preset/PresetCard",
  component: PresetCard,
  parameters: {
    layout: "padded",
  },
  args: {
    selectedDays: new Set<number>(),
    editRoutines: [],
    editPresetName: "",
    editPresetDescription: "",
    editSelectedRoutines: new Set<string>(),
    onSelect: fn(),
    onDelete: fn(),
    onToggleDay: fn(),
    onApply: fn(),
    onStartEdit: fn(),
    onCancelEdit: fn(),
    onSaveEdit: fn(),
    onChangeEditName: fn(),
    onChangeEditDescription: fn(),
    onToggleEditRoutine: fn(),
  },
} satisfies Meta<typeof PresetCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const preset: RoutinePreset = {
  id: "preset-1",
  name: "朝の健康ルーティン",
  description: "毎朝のストレッチ・瞑想・ランニングをまとめたプリセット",
  routineTemplates: [
    { title: "ストレッチ",   startTime: "06:00", duration: 10, category: "health" },
    { title: "瞑想",        startTime: "06:15", duration: 10, category: "health" },
    { title: "ランニング",   startTime: "06:30", duration: 30, category: "health" },
    { title: "朝食",        startTime: "07:00", duration: 20, category: "life"   },
  ],
  createdAt: "2026-01-01T00:00:00+09:00",
  updatedAt: "2026-01-01T00:00:00+09:00",
};

const minimalPreset: RoutinePreset = {
  id: "preset-2",
  name: "シンプルプリセット",
  routineTemplates: [
    { title: "読書", startTime: "22:00", duration: 30, category: "hobby" },
  ],
  createdAt: "2026-01-01T00:00:00+09:00",
  updatedAt: "2026-01-01T00:00:00+09:00",
};

export const Default: Story = {
  args: { preset, isSelected: false, isEditing: false },
};

export const WithoutDescription: Story = {
  args: { preset: minimalPreset, isSelected: false, isEditing: false },
};

export const Selected: Story = {
  args: {
    preset,
    isSelected: true,
    isEditing: false,
    selectedDays: new Set([1, 2, 3, 4, 5]),
  },
};

export const SelectedWithDaysChosen: Story = {
  args: {
    preset,
    isSelected: true,
    isEditing: false,
    selectedDays: new Set([1, 3, 5]),
  },
};

export const ClickEdit: Story = {
  args: { preset, isSelected: false, isEditing: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const editButton = canvas.getByRole("button", { name: /編集/ });
    await userEvent.click(editButton);
    expect(args.onStartEdit).toHaveBeenCalledOnce();
  },
};

export const ClickDelete: Story = {
  args: { preset, isSelected: false, isEditing: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDelete).toHaveBeenCalledOnce();
  },
};
