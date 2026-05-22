import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetExpenseList } from "./BudgetExpenseList";
import type { Expense } from "@/types/routine";

const meta = {
  title: "Features/Budget/BudgetExpenseList",
  component: BudgetExpenseList,
  parameters: {
    layout: "padded",
  },
  args: {
    onDelete: fn(),
  },
} satisfies Meta<typeof BudgetExpenseList>;

export default meta;
type Story = StoryObj<typeof meta>;

const expenses: Expense[] = [
  {
    id: "e-1",
    date: "2026-05-22",
    amount: 850,
    description: "ランチ",
    createdAt: "2026-05-22T12:30:00+09:00",
  },
  {
    id: "e-2",
    date: "2026-05-21",
    amount: 3200,
    description: "食料品",
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
    description: "交通費（新幹線）",
    createdAt: "2026-05-19T10:00:00+09:00",
  },
];

export const Empty: Story = {
  args: { expenses: [] },
};

export const SingleExpense: Story = {
  args: { expenses: [expenses[0]] },
};

export const MultipleExpenses: Story = {
  args: { expenses },
};

export const ClickDelete: Story = {
  args: { expenses: [expenses[0]] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDelete).toHaveBeenCalledWith("e-1");
  },
};
