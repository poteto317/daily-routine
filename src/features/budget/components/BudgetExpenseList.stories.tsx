import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetExpenseList } from "./BudgetExpenseList";
import type { BudgetCategory, Expense } from "@/types/routine";

const meta = {
  title: "Features/Budget/BudgetExpenseList",
  component: BudgetExpenseList,
  parameters: {
    layout: "padded",
  },
  args: {
    categories: [],
    editingExpenseId: null,
    editingExpenseDate: "",
    editingExpenseAmount: "",
    editingExpenseCategoryId: "",
    onStartEdit: fn(),
    onCancelEdit: fn(),
    onSaveEdit: fn(),
    onEditDateChange: fn(),
    onEditAmountChange: fn(),
    onEditCategoryIdChange: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof BudgetExpenseList>;

export default meta;
type Story = StoryObj<typeof meta>;

const categories: BudgetCategory[] = [
  { id: "cat-lunch", name: "ランチ", createdAt: "2026-05-01T00:00:00+09:00" },
  { id: "cat-grocery", name: "食料品", createdAt: "2026-05-01T00:00:00+09:00" },
  { id: "cat-transport", name: "交通費", createdAt: "2026-05-01T00:00:00+09:00" },
];

const expenses: Expense[] = [
  {
    id: "e-1",
    date: "2026-05-22",
    amount: 850,
    categoryId: "cat-lunch",
    createdAt: "2026-05-22T12:30:00+09:00",
  },
  {
    id: "e-2",
    date: "2026-05-21",
    amount: 3200,
    categoryId: "cat-grocery",
    createdAt: "2026-05-21T19:00:00+09:00",
  },
  {
    id: "e-3",
    date: "2026-05-20",
    amount: 500,
    createdAt: "2026-05-20T08:00:00+09:00",
  },
  {
    id: "e-4",
    date: "2026-05-19",
    amount: 12000,
    categoryId: "cat-transport",
    createdAt: "2026-05-19T10:00:00+09:00",
  },
];

export const Empty: Story = {
  args: { categories, expenses: [] },
};

export const SingleExpense: Story = {
  args: { categories, expenses: [expenses[0]] },
};

export const MultipleExpenses: Story = {
  args: { categories, expenses },
};

/** 1行が編集モードで表示された状態 */
export const EditingExpense: Story = {
  args: {
    categories,
    expenses,
    editingExpenseId: "e-1",
    editingExpenseDate: "2026-05-22",
    editingExpenseAmount: "850",
    editingExpenseCategoryId: "cat-lunch",
  },
};

export const ClickDelete: Story = {
  args: { categories, expenses: [expenses[0]] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDelete).toHaveBeenCalledWith("e-1");
  },
};

/** ✏️ボタンをクリック → onStartEdit が対象の支出で呼ばれる */
export const ClickEdit: Story = {
  args: { categories, expenses: [expenses[0]] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const editButton = canvas.getByRole("button", { name: /編集/ });
    await userEvent.click(editButton);
    expect(args.onStartEdit).toHaveBeenCalledWith(expenses[0]);
  },
};
