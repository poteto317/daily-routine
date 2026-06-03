import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PresetManager } from "./PresetManager";
import { savePresets } from "./storage";
import type { Routine, RoutinePreset } from "@/types/routine";

// PresetManager は usePresetManagerState() を内部で呼び出し、
// localStorage（routine-presets キー）からプリセット一覧を読み込む。
// beforeEach で savePresets() を使いデータを設定する。

const meta = {
  title: "Features/Preset/PresetManager",
  component: PresetManager,
  parameters: { layout: "fullscreen" },
  args: { onApplyPreset: fn() },
} satisfies Meta<typeof PresetManager>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRoutines: Routine[] = [
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

const samplePresets: RoutinePreset[] = [
  {
    id: "p-1",
    name: "朝の健康ルーティン",
    description: "ストレッチ・英語・ランニングをまとめたプリセット",
    routineTemplates: [
      { title: "朝のストレッチ", startTime: "07:00", duration: 15, category: "health" },
      { title: "英語学習",       startTime: "06:30", duration: 20, category: "study" },
    ],
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
  {
    id: "p-2",
    name: "週末セット",
    routineTemplates: [
      { title: "ランニング", startTime: "06:00", duration: 30, category: "health" },
      { title: "読書",       startTime: "22:00", duration: 30, category: "hobby" },
    ],
    createdAt: "2026-02-01T00:00:00+09:00",
    updatedAt: "2026-02-01T00:00:00+09:00",
  },
];

export const Empty: Story = {
  args: { currentRoutines: [] },
  beforeEach() {
    savePresets([]);
    return () => savePresets([]);
  },
};

export const WithRoutines: Story = {
  args: { currentRoutines: sampleRoutines },
  beforeEach() {
    savePresets([]);
    return () => savePresets([]);
  },
};

export const WithPresets: Story = {
  args: { currentRoutines: sampleRoutines },
  beforeEach() {
    savePresets(samplePresets);
    return () => savePresets([]);
  },
};

/** ➕ をクリック → プリセット作成フォームが展開される */
export const OpenCreateForm: Story = {
  args: { currentRoutines: sampleRoutines },
  beforeEach() {
    savePresets([]);
    return () => savePresets([]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole("button", { name: "➕" });
    await userEvent.click(openButton);
    const nameInput = canvas.getByPlaceholderText("例: 平日モーニングルーティン");
    expect(nameInput).toBeInTheDocument();
  },
};
