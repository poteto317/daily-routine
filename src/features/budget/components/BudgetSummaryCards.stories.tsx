import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetSummaryCards } from "./BudgetSummaryCards";

const defaultAllowance = {
  totalIncome: 350000,
  totalFixed: 81000,
  totalVariable: 30000,
  totalExpenseItems: 111000,
  allowance: 239000,
};

const meta = {
  title: "Features/Budget/BudgetSummaryCards",
  component: BudgetSummaryCards,
  parameters: {
    layout: "padded",
  },
  args: {
    onNavigateToAllowanceSettings: fn(),
    monthlyAllowance: defaultAllowance,
  },
} satisfies Meta<typeof BudgetSummaryCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithinBudget: Story = {
  args: {
    monthBudget: 100000,
    totalExpense: 42000,
    todayExpense: 1500,
    remaining: 58000,
    dailyBudget: 3226,
    dailyRemainingBudget: 2900,
    daysRemaining: 20,
    expenseCount: 8,
    isCurrentMonth: true,
  },
};

export const NearLimit: Story = {
  args: {
    monthBudget: 100000,
    totalExpense: 88000,
    todayExpense: 4200,
    remaining: 12000,
    dailyBudget: 3226,
    dailyRemainingBudget: 600,
    daysRemaining: 20,
    expenseCount: 23,
    isCurrentMonth: true,
  },
};

export const OverBudget: Story = {
  args: {
    monthBudget: 100000,
    totalExpense: 115000,
    todayExpense: 6000,
    remaining: -15000,
    dailyBudget: 3226,
    dailyRemainingBudget: 0,
    daysRemaining: 10,
    expenseCount: 31,
    isCurrentMonth: true,
  },
};

export const NoAllowanceSet: Story = {
  args: {
    monthBudget: 0,
    monthlyAllowance: {
      totalIncome: 0,
      totalFixed: 0,
      totalVariable: 0,
      totalExpenseItems: 0,
      allowance: 0,
    },
    totalExpense: 32000,
    todayExpense: 0,
    remaining: -32000,
    dailyBudget: 0,
    dailyRemainingBudget: 0,
    daysRemaining: 20,
    expenseCount: 5,
    isCurrentMonth: true,
  },
};

export const PastMonth: Story = {
  args: {
    monthBudget: 100000,
    totalExpense: 78000,
    todayExpense: 0,
    remaining: 22000,
    dailyBudget: 3226,
    dailyRemainingBudget: 0,
    daysRemaining: 0,
    expenseCount: 18,
    isCurrentMonth: false,
  },
};

/** 「収入・固定費・変動費を編集」リンクをクリック → onNavigateToAllowanceSettings が呼ばれる */
export const ClickEditAllowanceSettings: Story = {
  args: {
    monthBudget: 100000,
    totalExpense: 42000,
    todayExpense: 1500,
    remaining: 58000,
    dailyBudget: 3226,
    dailyRemainingBudget: 2900,
    daysRemaining: 20,
    expenseCount: 8,
    isCurrentMonth: true,
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
