import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { JournalEditCard } from "./JournalEditCard";
import type { JournalEntry } from "@/types/routine";

const meta = {
  title: "Features/Journal/JournalEditCard",
  component: JournalEditCard,
  parameters: {
    layout: "padded",
  },
  args: {
    today: "2026-05-21",
    dateInput: null,
    onTitleChange: fn(),
    onContentChange: fn(),
    onDateChange: fn(),
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
    dateInput: editingEntry.date,
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

/** 編集中に日付を変えたとき → 日付欄は選んだ値、見出しは編集前の日付のまま */
export const DateChanged: Story = {
  args: {
    editingEntry,
    titleInput: editingEntry.title,
    contentInput: editingEntry.content,
    dateInput: "2026-05-18",
  },
};

/** 日付欄を変更 → onDateChange が選んだ値で呼ばれる */
export const ChangeDate: Story = {
  args: {
    editingEntry,
    titleInput: editingEntry.title,
    contentInput: editingEntry.content,
    dateInput: editingEntry.date,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByLabelText("日付"), {
      target: { value: "2026-05-19" },
    });
    expect(args.onDateChange).toHaveBeenCalledWith("2026-05-19");
  },
};
