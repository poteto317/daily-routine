import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { BudgetCategory, BudgetData } from "@/types/routine";
import { NavigationContextProvider } from "@/features/routine/pages/NavigationContext";
import { BudgetPage } from "./BudgetPage";
import { saveBudgetData } from "./storageData";
import { saveBudgetCategories } from "./storageCategories";

// BudgetPage は useBudgetPageState() を内部で呼び出す。
// localStorage（budget-data / budget-categories キー）からデータを読み込む。
// beforeEach で saveBudgetData() / saveBudgetCategories() を使いデータを設定する。
// BudgetPage は useNavigationContext() も呼び出すため
// NavigationContextProvider デコレーターで navigate 関数を注入する。

const withNavigationContext: Decorator = (Story) => (
  <NavigationContextProvider value={fn()}>
    <Story />
  </NavigationContextProvider>
);

const meta = {
  title: "Features/Budget/BudgetPage",
  component: BudgetPage,
  parameters: { layout: "fullscreen" },
  decorators: [withNavigationContext],
} satisfies Meta<typeof BudgetPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const currentMonth = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
})();

const sampleCategories: BudgetCategory[] = [
  { id: "cat-food", name: "食費", createdAt: new Date().toISOString() },
  { id: "cat-transport", name: "交通費", createdAt: new Date().toISOString() },
];

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
        date: `${currentMonth}-10`,
        categoryId: "cat-food",
        createdAt: new Date().toISOString(),
      },
      {
        id: "exp-2",
        amount: 5000,
        date: `${currentMonth}-15`,
        categoryId: "cat-transport",
        createdAt: new Date().toISOString(),
      },
    ],
  },
};

const emptyBudgetData: BudgetData = { budgets: {}, expenses: {} };

export const Default: Story = {
  beforeEach() {
    saveBudgetData(emptyBudgetData);
    saveBudgetCategories([]);
    return () => {
      saveBudgetData(emptyBudgetData);
      saveBudgetCategories([]);
    };
  },
};

export const WithData: Story = {
  beforeEach() {
    saveBudgetData(sampleBudgetData);
    saveBudgetCategories(sampleCategories);
    return () => {
      saveBudgetData(emptyBudgetData);
      saveBudgetCategories([]);
    };
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
