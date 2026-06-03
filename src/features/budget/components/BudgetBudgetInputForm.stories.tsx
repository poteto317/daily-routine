import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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

/** 予算を入力して保存 → onSave が呼ばれる */
export const TypeAndSave: Story = {
  args: { value: "" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await userEvent.type(input, "80000");
    const saveButton = canvas.getByRole("button", { name: "保存" });
    await userEvent.click(saveButton);
    expect(args.onSave).toHaveBeenCalledOnce();
  },
};

/** キャンセルボタンをクリック → onCancel が呼ばれる */
export const ClickCancel: Story = {
  args: { value: "50000" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cancelButton = canvas.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton);
    expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
