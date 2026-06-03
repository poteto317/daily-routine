import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { MealPage } from "./MealPage";
import { saveMealHistory } from "./storage";
import type { MealHistory } from "@/types/routine";

// MealPage は useMealPageState() を内部で呼び出す。
// localStorage（meal-history キー）からデータを読み込む。
// beforeEach で saveMealHistory() を使いデータを設定する。

const meta = {
  title: "Features/Meal/MealPage",
  component: MealPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MealPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleHistory: MealHistory = {
  "2026-05-29": [
    {
      id: "m-1",
      date: "2026-05-29",
      mealType: "breakfast",
      time: "07:30",
      description: "トースト・目玉焼き・サラダ",
      createdAt: "2026-05-29T07:30:00+09:00",
      updatedAt: "2026-05-29T07:30:00+09:00",
    },
    {
      id: "m-2",
      date: "2026-05-29",
      mealType: "lunch",
      time: "12:00",
      description: "カレーライス",
      notes: "辛さ3辛",
      createdAt: "2026-05-29T12:00:00+09:00",
      updatedAt: "2026-05-29T12:00:00+09:00",
    },
  ],
  "2026-05-28": [
    {
      id: "m-3",
      date: "2026-05-28",
      mealType: "dinner",
      time: "19:00",
      description: "鶏の照り焼き定食",
      createdAt: "2026-05-28T19:00:00+09:00",
      updatedAt: "2026-05-28T19:00:00+09:00",
    },
  ],
};

export const Default: Story = {
  beforeEach() {
    saveMealHistory({});
    return () => saveMealHistory({});
  },
};

export const WithHistory: Story = {
  beforeEach() {
    saveMealHistory(sampleHistory);
    return () => saveMealHistory({});
  },
};

export const ClickAdd: Story = {
  name: "ClickAdd: ➕ ボタンをクリックすると食事入力フォームが開く",
  beforeEach() {
    saveMealHistory({});
    return () => saveMealHistory({});
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: "➕" });
    await userEvent.click(addButton);
    await expect(canvas.getByRole("combobox")).toBeTruthy();
  },
};
