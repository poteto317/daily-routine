import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { JournalEditCard } from "./JournalEditCard";
import type { JournalEntry } from "@/types/routine";

const meta = {
  title: "Features/Journal/JournalEditCard",
  component: JournalEditCard,
  parameters: {
    layout: "padded",
  },
  args: {
    onTitleChange: fn(),
    onContentChange: fn(),
    onUpdate: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof JournalEditCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const editingEntry: JournalEntry = {
  id: "j-1",
  date: "2026-05-20",
  title: "5月20日の振り返り",
  content: "今日も集中できた。タスクを全部終わらせることができた。",
  createdAt: "2026-05-20T22:00:00+09:00",
  updatedAt: "2026-05-20T22:00:00+09:00",
};

export const Default: Story = {
  args: {
    editingEntry,
    titleInput: editingEntry.title,
    contentInput: editingEntry.content,
  },
};

export const EmptyInputs: Story = {
  args: {
    editingEntry,
    titleInput: "",
    contentInput: "",
  },
};

export const ClickUpdate: Story = {
  args: {
    editingEntry,
    titleInput: "更新後のタイトル",
    contentInput: "更新後の内容。",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const updateButton = canvas.getByRole("button", { name: /更新|保存/ });
    await userEvent.click(updateButton);
    expect(args.onUpdate).toHaveBeenCalledOnce();
  },
};

export const ClickCancel: Story = {
  args: {
    editingEntry,
    titleInput: editingEntry.title,
    contentInput: editingEntry.content,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cancelButton = canvas.getByRole("button", { name: /キャンセル/ });
    await userEvent.click(cancelButton);
    expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
