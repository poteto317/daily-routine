import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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
    onSelectSourceDay: fn(),
    onCreatePreset: fn(),
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
    sourceDay: null,
  },
};

export const OpenEmpty: Story = {
  args: {
    isCreating: true,
    currentRoutines: routines,
    newPresetName: "",
    newPresetDescription: "",
    sourceDay: null,
  },
};

export const OpenWithSourceDay: Story = {
  args: {
    isCreating: true,
    currentRoutines: routines,
    newPresetName: "朝のルーティン",
    newPresetDescription: "毎朝の基本セット",
    sourceDay: 1,
  },
};

export const NoRoutines: Story = {
  args: {
    isCreating: true,
    currentRoutines: [],
    newPresetName: "",
    newPresetDescription: "",
    sourceDay: null,
  },
};

/** 「➕」ボタンをクリック → onToggleCreating が呼ばれる（フォームを開く） */
export const ClickOpenForm: Story = {
  args: {
    isCreating: false,
    currentRoutines: [],
    newPresetName: "",
    newPresetDescription: "",
    sourceDay: null,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole("button", { name: "➕" });
    await userEvent.click(openButton);
    expect(args.onToggleCreating).toHaveBeenCalledOnce();
  },
};

/** プリセット名を入力 → onChangeName が呼ばれる */
export const TypePresetName: Story = {
  args: {
    isCreating: true,
    currentRoutines: [],
    newPresetName: "",
    newPresetDescription: "",
    sourceDay: null,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const nameInput =
      canvas.getByPlaceholderText("例: 平日モーニングルーティン");
    await userEvent.type(nameInput, "朝のルーティン");
    expect(args.onChangeName).toHaveBeenCalled();
  },
};
