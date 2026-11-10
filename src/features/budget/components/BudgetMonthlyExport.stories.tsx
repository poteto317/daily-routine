import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BudgetMonthlyExport } from "./BudgetMonthlyExport";

const meta = {
  title: "Features/Budget/BudgetMonthlyExport",
  component: BudgetMonthlyExport,
  args: {
    month: "2026-11",
    expenses: [
      {
        id: "expense-1",
        date: "2026-11-01",
        amount: 1500,
        categoryId: "food",
        createdAt: "2026-11-01T03:00:00Z",
      },
    ],
    categories: [
      { id: "food", name: "食費", createdAt: "2026-11-01T00:00:00Z" },
    ],
  },
} satisfies Meta<typeof BudgetMonthlyExport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { expenses: [] } };
export const ZeroAmount: Story = {
  args: { expenses: [{ ...meta.args.expenses[0], amount: 0 }] },
};
