import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { BudgetCategory } from "@/types/routine";
import { BudgetExpenseForm } from "./BudgetExpenseForm";

const categories: BudgetCategory[] = [
  { id: "cat-lunch", name: "ランチ", createdAt: "2026-05-01T00:00:00+09:00" },
  { id: "cat-grocery", name: "食料品", createdAt: "2026-05-01T00:00:00+09:00" },
];

const meta = {
  title: "Features/Budget/BudgetExpenseForm",
  component: BudgetExpenseForm,
  parameters: {
    layout: "padded",
  },
  args: {
    categories,
    currentDate: new Date(2026, 4, 22),
    onAdd: fn(),
    onAmountChange: fn(),
    onCancel: fn(),
    onDateChange: fn(),
    onCategoryIdChange: fn(),
  },
} satisfies Meta<typeof BudgetExpenseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { expenseDate: "2026-05-22", expenseAmount: "", expenseCategoryId: "" },
};

export const WithAmount: Story = {
  args: {
    expenseDate: "2026-05-22",
    expenseAmount: "1500",
    expenseCategoryId: "",
  },
};

export const WithAll: Story = {
  args: {
    expenseDate: "2026-05-22",
    expenseAmount: "850",
    expenseCategoryId: "cat-lunch",
  },
};

export const ClickAdd: Story = {
  args: {
    expenseDate: "2026-05-22",
    expenseAmount: "1500",
    expenseCategoryId: "cat-grocery",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: /追加|登録/ });
    await userEvent.click(addButton);
    expect(args.onAdd).toHaveBeenCalledOnce();
  },
};
