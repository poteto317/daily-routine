import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TodoItemTitleButton } from "./TodoItemTitleButton";

const meta = {
  title: "Features/TodoLists/TodoItemTitleButton",
  component: TodoItemTitleButton,
  parameters: {
    layout: "padded",
  },
  args: {
    onToggleAction: fn(),
  },
} satisfies Meta<typeof TodoItemTitleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Incomplete: Story = {
  args: {
    title: "牛乳を買う",
    isCompleted: false,
    isDragActive: false,
  },
};

export const Completed: Story = {
  args: {
    title: "牛乳を買う",
    isCompleted: true,
    isDragActive: false,
  },
};

export const DragActive: Story = {
  args: {
    title: "ドラッグ中のアイテム",
    isCompleted: false,
    isDragActive: true,
  },
};

export const LongTitle: Story = {
  args: {
    title: "とても長いタスクのタイトルが入った場合にどのように表示されるかを確認するためのサンプルテキストです",
    isCompleted: false,
    isDragActive: false,
  },
};

export const CompletedLongTitle: Story = {
  args: {
    title: "完了済みのとても長いタスクのタイトルが入った場合にどのように表示されるかを確認するためのサンプルテキストです",
    isCompleted: true,
    isDragActive: false,
  },
};

export const ClickToComplete: Story = {
  args: {
    title: "牛乳を買う",
    isCompleted: false,
    isDragActive: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "「牛乳を買う」を完了にする",
    });
    await userEvent.click(button);
    expect(args.onToggleAction).toHaveBeenCalledOnce();
  },
};

export const DisabledWhileDragging: Story = {
  args: {
    title: "牛乳を買う",
    isCompleted: false,
    isDragActive: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "「牛乳を買う」を完了にする",
    });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(args.onToggleAction).not.toHaveBeenCalled();
  },
};
