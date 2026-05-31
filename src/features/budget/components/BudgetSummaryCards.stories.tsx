import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetSummaryCards } from "./BudgetSummaryCards";

const meta = {
  title: "Features/Budget/BudgetSummaryCards",
  component: BudgetSummaryCards,
  parameters: {
    layout: "padded",
  },
  args: {
    onOpenBudgetInput: fn(),
  },
} satisfies Meta<typeof BudgetSummaryCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithinBudget: Story = {
  args: {
    monthBudget: 100000,
    totalExpense: 42000,
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
    remaining: -15000,
    dailyBudget: 3226,
    dailyRemainingBudget: 0,
    daysRemaining: 10,
    expenseCount: 31,
    isCurrentMonth: true,
  },
};

export const NoBudgetSet: Story = {
  args: {
    monthBudget: 0,
    totalExpense: 32000,
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
    remaining: 22000,
    dailyBudget: 3226,
    dailyRemainingBudget: 0,
    daysRemaining: 0,
    expenseCount: 18,
    isCurrentMonth: false,
  },
};

/** 「変更」ボタンをクリック → onOpenBudgetInput が呼ばれる */
export const ClickChangeBudget: Story = {
  args: {
    monthBudget: 100000,
    totalExpense: 42000,
    remaining: 58000,
    dailyBudget: 3226,
    dailyRemainingBudget: 2900,
    daysRemaining: 20,
    expenseCount: 8,
    isCurrentMonth: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const changeBudgetButton = canvas.getByRole("button", { name: "変更" });
    await userEvent.click(changeBudgetButton);
    expect(args.onOpenBudgetInput).toHaveBeenCalledOnce();
  },
};
