import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BudgetDailySummaryCards } from "./BudgetDailySummaryCards";

const meta = {
  title: "Features/Budget/BudgetDailySummaryCards",
  component: BudgetDailySummaryCards,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof BudgetDailySummaryCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithinBudget: Story = {
  args: {
    todayExpense: 1500,
    dailyRemainingBudget: 2900,
    daysRemaining: 20,
    isCurrentMonth: true,
  },
};

export const NearLimit: Story = {
  args: {
    todayExpense: 4200,
    dailyRemainingBudget: 600,
    daysRemaining: 20,
    isCurrentMonth: true,
  },
};

export const OverBudget: Story = {
  args: {
    todayExpense: 6000,
    dailyRemainingBudget: 0,
    daysRemaining: 10,
    isCurrentMonth: true,
  },
};

export const PastMonth: Story = {
  args: {
    todayExpense: 0,
    dailyRemainingBudget: 0,
    daysRemaining: 0,
    isCurrentMonth: false,
  },
};
