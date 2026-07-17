import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type {
  BudgetCategory,
  BudgetData,
  BudgetExpenseItem,
  BudgetIncomeItem,
} from "@/types/routine";
import { NavigationContextProvider } from "@/features/routine/pages/NavigationContext";
import { BudgetPage } from "./BudgetPage";
import { saveBudgetData } from "./storageData";
import { saveBudgetCategories } from "./storageCategories";
import { saveBudgetIncomeItems } from "./storageIncomeItems";
import { saveBudgetExpenseItems } from "./storageExpenseItems";

// BudgetPage は useBudgetPageState() を内部で呼び出す。
// localStorage（budget-data / budget-categories / budget-income-items /
// budget-expense-items キー）からデータを読み込む。
// beforeEach で saveBudgetData() 等を使いデータを設定する。
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

const sampleIncomeItems: BudgetIncomeItem[] = [
  { id: "income-1", name: "給与", amount: 300000, createdAt: new Date().toISOString() },
];

const sampleExpenseItems: BudgetExpenseItem[] = [
  {
    id: "expense-1",
    name: "家賃",
    amount: 80000,
    kind: "fixed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "expense-2",
    name: "食費",
    amount: 30000,
    kind: "variable",
    createdAt: new Date().toISOString(),
  },
];

const sampleBudgetData: BudgetData = {
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

const emptyBudgetData: BudgetData = { expenses: {} };

export const Default: Story = {
  beforeEach() {
    saveBudgetData(emptyBudgetData);
    saveBudgetCategories([]);
    saveBudgetIncomeItems([]);
    saveBudgetExpenseItems([]);
    return () => {
      saveBudgetData(emptyBudgetData);
      saveBudgetCategories([]);
      saveBudgetIncomeItems([]);
      saveBudgetExpenseItems([]);
    };
  },
};

export const WithData: Story = {
  beforeEach() {
    saveBudgetData(sampleBudgetData);
    saveBudgetCategories(sampleCategories);
    saveBudgetIncomeItems(sampleIncomeItems);
    saveBudgetExpenseItems(sampleExpenseItems);
    return () => {
      saveBudgetData(emptyBudgetData);
      saveBudgetCategories([]);
      saveBudgetIncomeItems([]);
      saveBudgetExpenseItems([]);
    };
  },
};

/** ➕ボタンをクリック → 支出フォームが開く */
export const ClickAddExpense: Story = {
  beforeEach() {
    saveBudgetData(emptyBudgetData);
    saveBudgetIncomeItems([]);
    saveBudgetExpenseItems([]);
    return () => saveBudgetData(emptyBudgetData);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: "➕" });
    await userEvent.click(addButton);
    expect(canvas.getByPlaceholderText("例: 1500")).toBeTruthy();
  },
};
