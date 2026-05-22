import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RoutineFormFooter } from "./RoutineFormFooter";

const meta = {
  title: "Features/Routine/RoutineFormFooter",
  component: RoutineFormFooter,
  parameters: {
    layout: "padded",
  },
  args: {
    onCancel: fn(),
  },
} satisfies Meta<typeof RoutineFormFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddModeEnabled: Story = {
  args: { isEditMode: false, isSubmitDisabled: false },
};

export const AddModeDisabled: Story = {
  args: { isEditMode: false, isSubmitDisabled: true },
};

export const EditModeEnabled: Story = {
  args: { isEditMode: true, isSubmitDisabled: false },
};

export const ClickCancel: Story = {
  args: { isEditMode: false, isSubmitDisabled: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cancelButton = canvas.getByRole("button", { name: /キャンセル/ });
    await userEvent.click(cancelButton);
    expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
