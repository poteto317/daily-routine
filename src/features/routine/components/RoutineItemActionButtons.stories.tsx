import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RoutineItemActionButtons } from "./RoutineItemActionButtons";

const meta = {
  title: "Features/Routine/RoutineItemActionButtons",
  component: RoutineItemActionButtons,
  parameters: {
    layout: "padded",
  },
  args: {
    onEditAction: fn(),
    onDeleteAction: fn(),
  },
} satisfies Meta<typeof RoutineItemActionButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClickEdit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const editButton = canvas.getByRole("button", { name: /編集/ });
    await userEvent.click(editButton);
    expect(args.onEditAction).toHaveBeenCalledOnce();
    expect(args.onDeleteAction).not.toHaveBeenCalled();
  },
};

export const ClickDelete: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDeleteAction).toHaveBeenCalledOnce();
    expect(args.onEditAction).not.toHaveBeenCalled();
  },
};
