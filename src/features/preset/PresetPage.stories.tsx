import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { PresetPage } from "./PresetPage";
import { saveRoutines } from "@/features/routine";
import type { Routine } from "@/types/routine";

// PresetPage は useRoutines() を内部で呼び出し、
// localStorage（daily-routines キー）からルーティン一覧を読み込む。
// beforeEach で saveRoutines() を使いデータを設定する。

const meta = {
  title: "Features/Preset/PresetPage",
  component: PresetPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PresetPage>;

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
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "r-2",
    title: "読書",
    startTime: "21:00",
    duration: 30,
    category: "hobby",
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    isCompleted: false,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

/** ルーティンなし: 空のプリセットマネージャーが表示される */
export const Default: Story = {
  beforeEach() {
    saveRoutines([]);
    return () => saveRoutines([]);
  },
};

/** ルーティンあり: 現在のルーティンをプリセットとして保存できる */
export const WithRoutines: Story = {
  beforeEach() {
    saveRoutines(sampleRoutines);
    return () => saveRoutines([]);
  },
};

/** ➕ボタンをクリック → プリセット作成フォームが開く */
export const ClickOpenCreateForm: Story = {
  beforeEach() {
    saveRoutines(sampleRoutines);
    return () => saveRoutines([]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole("button", { name: "➕" });
    await userEvent.click(openButton);
    // フォームが開いたら入力欄が表示される
    expect(canvas.getByRole("textbox")).toBeTruthy();
  },
};
