import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetMonthlySummaryCards } from "./BudgetMonthlySummaryCards";

const allowanceWithMonthBudget = (allowance: number) => ({
  totalIncome: 300000,
  totalFixed: 150000,
  totalVariable: 50000,
  totalExpenseItems: 200000,
  allowance,
});

const meta = {
  title: "Features/Budget/BudgetMonthlySummaryCards",
  component: BudgetMonthlySummaryCards,
  parameters: {
    layout: "padded",
  },
  args: {
    onNavigateToAllowanceSettings: fn(),
  },
} satisfies Meta<typeof BudgetMonthlySummaryCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithinBudget: Story = {
  args: {
    monthlyAllowance: allowanceWithMonthBudget(100000),
    totalExpense: 42000,
    remaining: 58000,
    dailyBudget: 3226,
    expenseCount: 8,
  },
};

export const NearLimit: Story = {
  args: {
    monthlyAllowance: allowanceWithMonthBudget(100000),
    totalExpense: 88000,
    remaining: 12000,
    dailyBudget: 3226,
    expenseCount: 23,
  },
};

export const OverBudget: Story = {
  args: {
    monthlyAllowance: allowanceWithMonthBudget(100000),
    totalExpense: 115000,
    remaining: -15000,
    dailyBudget: 3226,
    expenseCount: 31,
  },
};

export const NoAllowanceSet: Story = {
  args: {
    monthlyAllowance: {
      totalIncome: 0,
      totalFixed: 0,
      totalVariable: 0,
      totalExpenseItems: 0,
      allowance: 0,
    },
    totalExpense: 32000,
    remaining: -32000,
    dailyBudget: 0,
    expenseCount: 5,
  },
};

/** 「収入・固定費・変動費を編集」リンクをクリック → onNavigateToAllowanceSettings が呼ばれる */
export const ClickEditAllowanceSettings: Story = {
  args: {
    monthlyAllowance: allowanceWithMonthBudget(100000),
    totalExpense: 42000,
    remaining: 58000,
    dailyBudget: 3226,
    expenseCount: 8,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const editButton = canvas.getByRole("button", {
      name: "収入・固定費・変動費を編集",
    });
    await userEvent.click(editButton);
    expect(args.onNavigateToAllowanceSettings).toHaveBeenCalledOnce();
  },
};
