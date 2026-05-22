import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetExpenseForm } from "./BudgetExpenseForm";

const meta = {
  title: "Features/Budget/BudgetExpenseForm",
  component: BudgetExpenseForm,
  parameters: {
    layout: "padded",
  },
  args: {
    currentDate: new Date("2026-05-22"),
    onAdd: fn(),
    onAmountChange: fn(),
    onCancel: fn(),
    onDateChange: fn(),
    onDescriptionChange: fn(),
  },
} satisfies Meta<typeof BudgetExpenseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { expenseDate: "2026-05-22", expenseAmount: "", expenseDescription: "" },
};

export const WithAmount: Story = {
  args: {
    expenseDate: "2026-05-22",
    expenseAmount: "1500",
    expenseDescription: "",
  },
};

export const WithAll: Story = {
  args: {
    expenseDate: "2026-05-22",
    expenseAmount: "850",
    expenseDescription: "ランチ（定食）",
  },
};

export const ClickAdd: Story = {
  args: {
    expenseDate: "2026-05-22",
    expenseAmount: "1500",
    expenseDescription: "食料品",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: /追加|登録/ });
    await userEvent.click(addButton);
    expect(args.onAdd).toHaveBeenCalledOnce();
  },
};
