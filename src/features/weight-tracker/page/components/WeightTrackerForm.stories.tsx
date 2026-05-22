import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WeightTrackerForm } from "./WeightTrackerForm";

const meta = {
  title: "Features/WeightTracker/WeightTrackerForm",
  component: WeightTrackerForm,
  parameters: {
    layout: "padded",
  },
  args: {
    onWeightChange: fn(),
    onNotesChange: fn(),
    onSave: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof WeightTrackerForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { weightInput: "", notesInput: "" },
};

export const WithWeight: Story = {
  args: { weightInput: "68.5", notesInput: "" },
};

export const WithAll: Story = {
  args: {
    weightInput: "68.5",
    notesInput: "朝食前。昨日より0.3kg減。",
  },
};

export const ClickSave: Story = {
  args: { weightInput: "68.5", notesInput: "" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole("button", { name: /保存|記録/ });
    await userEvent.click(saveButton);
    expect(args.onSave).toHaveBeenCalledOnce();
  },
};

export const ClickCancel: Story = {
  args: { weightInput: "68.5", notesInput: "" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cancelButton = canvas.getByRole("button", { name: /キャンセル/ });
    await userEvent.click(cancelButton);
    expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
