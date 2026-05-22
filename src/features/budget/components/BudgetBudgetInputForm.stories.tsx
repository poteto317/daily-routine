import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { BudgetBudgetInputForm } from "./BudgetBudgetInputForm";

const meta = {
  title: "Features/Budget/BudgetBudgetInputForm",
  component: BudgetBudgetInputForm,
  parameters: { layout: "padded" },
  args: {
    onChange: fn(),
    onCancel: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof BudgetBudgetInputForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { value: "" },
};

export const WithValue: Story = {
  args: { value: "100000" },
};
