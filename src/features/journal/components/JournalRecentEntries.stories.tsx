import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { JournalRecentEntries } from "./JournalRecentEntries";
import type { JournalEntry } from "@/types/routine";

const meta = {
  title: "Features/Journal/JournalRecentEntries",
  component: JournalRecentEntries,
  parameters: {
    layout: "padded",
  },
  args: {
    onDeleteEntry: fn(),
    onEditEntry: fn(),
  },
} satisfies Meta<typeof JournalRecentEntries>;

export default meta;
type Story = StoryObj<typeof meta>;

const entries: JournalEntry[] = [
  {
    id: "j-1",
    date: "2026-05-21",
    title: "今日の振り返り",
    content:
      "朝のルーティンを全て完了。集中できた時間が長く、生産性が高かった。\n明日は早起きしてランニングから始めたい。",
    createdAt: "2026-05-21T21:00:00+09:00",
    updatedAt: "2026-05-21T21:15:00+09:00",
  },
  {
    id: "j-2",
    date: "2026-05-20",
    title: "5月20日",
    content: "少し疲れが溜まっているが、重要なタスクは全て完了できた。",
    createdAt: "2026-05-20T22:00:00+09:00",
    updatedAt: "2026-05-20T22:00:00+09:00",
  },
  {
    id: "j-3",
    date: "2026-05-19",
    title: "週の折り返し",
    content: "今週の目標の半分をクリア。後半も集中して取り組む。",
    createdAt: "2026-05-19T21:30:00+09:00",
    updatedAt: "2026-05-19T21:30:00+09:00",
  },
];

export const Empty: Story = {
  args: { entries: [] },
};

export const SingleEntry: Story = {
  args: { entries: [entries[0]] },
};

export const MultipleEntries: Story = {
  args: { entries },
};

export const ClickEdit: Story = {
  args: { entries: [entries[0]] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const editButton = canvas.getByRole("button", { name: /編集/ });
    await userEvent.click(editButton);
    expect(args.onEditEntry).toHaveBeenCalledWith(entries[0]);
  },
};

export const ClickDelete: Story = {
  args: { entries: [entries[0]] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDeleteEntry).toHaveBeenCalledWith(entries[0]);
  },
};
