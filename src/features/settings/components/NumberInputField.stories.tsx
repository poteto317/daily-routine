import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NumberInputField } from "./NumberInputField";

const meta = {
  title: "Features/Settings/NumberInputField",
  component: NumberInputField,
  parameters: {
    layout: "padded",
  },
  args: {
    label: "作業時間",
    description: "ポモドーロ1セットの作業時間を設定します。",
    min: 1,
    max: 60,
    errorText: "1〜60の範囲で入力してください。",
    hint: "推奨: 25分",
    onChange: fn(),
  },
} satisfies Meta<typeof NumberInputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "25" },
};

export const BelowMin: Story = {
  args: { value: "0" },
};

export const AboveMax: Story = {
  args: { value: "99" },
};

export const EmptyValue: Story = {
  args: { value: "" },
};

export const MaxValue: Story = {
  args: { value: "60" },
};

export const TypeNewValue: Story = {
  args: { value: "25" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "30");
    expect(args.onChange).toHaveBeenCalled();
  },
};

export const ShowsErrorOnInvalidInput: Story = {
  args: { value: "0" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const errorMessage = canvas.getByText("1〜60の範囲で入力してください。");
    expect(errorMessage).toBeInTheDocument();
  },
};
