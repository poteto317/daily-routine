import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TodoItemTitleArea } from "./TodoItemTitleArea";

const meta = {
  title: "Features/TodoLists/TodoItemTitleArea",
  component: TodoItemTitleArea,
  parameters: {
    layout: "padded",
  },
  args: {
    onToggle: fn(),
    onCommitEdit: fn(),
    onCancelEdit: fn(),
    onChangeTitle: fn(),
  },
} satisfies Meta<typeof TodoItemTitleArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    itemId: "item-1",
    title: "牛乳を買う",
    isCompleted: false,
    isEditing: false,
    editingTitle: "",
    isDragActive: false,
  },
};

export const Completed: Story = {
  args: {
    itemId: "item-1",
    title: "牛乳を買う",
    isCompleted: true,
    isEditing: false,
    editingTitle: "",
    isDragActive: false,
  },
};

export const Editing: Story = {
  args: {
    itemId: "item-1",
    title: "牛乳を買う",
    isCompleted: false,
    isEditing: true,
    editingTitle: "牛乳を買う",
    isDragActive: false,
  },
};

export const EditingEmpty: Story = {
  args: {
    itemId: "item-1",
    title: "牛乳を買う",
    isCompleted: false,
    isEditing: true,
    editingTitle: "",
    isDragActive: false,
  },
};

export const DragActive: Story = {
  args: {
    itemId: "item-1",
    title: "ドラッグ中のアイテム",
    isCompleted: false,
    isEditing: false,
    editingTitle: "",
    isDragActive: true,
  },
};

export const ClickToToggle: Story = {
  args: {
    itemId: "item-1",
    title: "牛乳を買う",
    isCompleted: false,
    isEditing: false,
    editingTitle: "",
    isDragActive: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "「牛乳を買う」を完了にする",
    });
    await userEvent.click(button);
    expect(args.onToggle).toHaveBeenCalledOnce();
  },
};

export const TypeAndSubmit: Story = {
  args: {
    itemId: "item-1",
    title: "牛乳を買う",
    isCompleted: false,
    isEditing: true,
    editingTitle: "牛乳を買う",
    isDragActive: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "卵を買う");
    await userEvent.keyboard("{Enter}");
    expect(args.onCommitEdit).toHaveBeenCalledOnce();
  },
};

export const EscapeToCancel: Story = {
  args: {
    itemId: "item-1",
    title: "牛乳を買う",
    isCompleted: false,
    isEditing: true,
    editingTitle: "変更中...",
    isDragActive: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.click(input);
    await userEvent.keyboard("{Escape}");
    expect(args.onCancelEdit).toHaveBeenCalledOnce();
  },
};
