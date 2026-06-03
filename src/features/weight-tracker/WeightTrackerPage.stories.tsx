import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { WeightTrackerPage } from "./WeightTrackerPage";
import { saveWeightHistory } from "./storage";
import type { WeightHistory } from "@/types/routine";

// WeightTrackerPage は useWeightTrackerState() を内部で呼び出す。
// localStorage（weight-history キー）からデータを読み込む。
// beforeEach で saveWeightHistory() を使いデータを設定する。

const meta = {
  title: "Features/WeightTracker/WeightTrackerPage",
  component: WeightTrackerPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WeightTrackerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleHistory: WeightHistory = {
  "2026-05-29": {
    id: "w-1",
    date: "2026-05-29",
    weight: 65.4,
    notes: "朝食前",
    createdAt: "2026-05-29T07:00:00+09:00",
    updatedAt: "2026-05-29T07:00:00+09:00",
  },
  "2026-05-28": {
    id: "w-2",
    date: "2026-05-28",
    weight: 65.8,
    createdAt: "2026-05-28T07:00:00+09:00",
    updatedAt: "2026-05-28T07:00:00+09:00",
  },
  "2026-05-27": {
    id: "w-3",
    date: "2026-05-27",
    weight: 66.2,
    notes: "少し増えた",
    createdAt: "2026-05-27T07:00:00+09:00",
    updatedAt: "2026-05-27T07:00:00+09:00",
  },
};

export const Default: Story = {
  beforeEach() {
    saveWeightHistory({});
    return () => saveWeightHistory({});
  },
};

export const WithHistory: Story = {
  beforeEach() {
    saveWeightHistory(sampleHistory);
    return () => saveWeightHistory({});
  },
};

/** ➕ボタンをクリック → 体重入力フォームが開く */
export const ClickAdd: Story = {
  beforeEach() {
    saveWeightHistory({});
    return () => saveWeightHistory({});
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: "➕" });
    await userEvent.click(addButton);
    expect(canvas.getByRole("spinbutton")).toBeTruthy();
  },
};
