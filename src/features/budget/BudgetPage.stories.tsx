import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import type { BudgetData } from "@/types/routine";
import { BudgetPage } from "./BudgetPage";
import { saveBudgetData } from "./storageData";

// BudgetPage は useBudgetPageState() を内部で呼び出す。
// localStorage（budget-data キー）からデータを読み込む。
// beforeEach で saveBudgetData() を使いデータを設定する。

const meta = {
  title: "Features/Budget/BudgetPage",
  component: BudgetPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BudgetPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const currentMonth = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
})();

const sampleBudgetData: BudgetData = {
  budgets: {
    [currentMonth]: {
      id: "budget-1",
      month: currentMonth,
      totalAmount: 100000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  expenses: {
    [currentMonth]: [
      {
        id: "exp-1",
        amount: 12000,
        description: "スーパー食材",
        date: `${currentMonth}-10`,
        category: "食費",
        createdAt: new Date().toISOString(),
      },
      {
        id: "exp-2",
        amount: 5000,
        description: "電車代",
        date: `${currentMonth}-15`,
        category: "交通費",
        createdAt: new Date().toISOString(),
      },
    ],
  },
};

const emptyBudgetData: BudgetData = { budgets: {}, expenses: {} };

export const Default: Story = {
  beforeEach() {
    saveBudgetData(emptyBudgetData);
    return () => saveBudgetData(emptyBudgetData);
  },
};

export const WithData: Story = {
  beforeEach() {
    saveBudgetData(sampleBudgetData);
    return () => saveBudgetData(emptyBudgetData);
  },
};

/** ➕ボタンをクリック → 支出フォームが開く */
export const ClickAddExpense: Story = {
  beforeEach() {
    saveBudgetData(emptyBudgetData);
    return () => saveBudgetData(emptyBudgetData);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: "➕" });
    await userEvent.click(addButton);
    expect(canvas.getByPlaceholderText("例: 1500")).toBeTruthy();
  },
};
