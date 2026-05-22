import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { JournalTodayCard } from "./JournalTodayCard";
import type { JournalEntry } from "@/types/routine";

const meta = {
  title: "Features/Journal/JournalTodayCard",
  component: JournalTodayCard,
  parameters: {
    layout: "padded",
  },
  args: {
    today: "2026-05-21",
    onCancel: fn(),
    onContentChange: fn(),
    onEditEntry: fn(),
    onOpenForm: fn(),
    onSave: fn(),
    onUpdate: fn(),
    onTitleChange: fn(),
  },
} satisfies Meta<typeof JournalTodayCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const todayEntry: JournalEntry = {
  id: "j-1",
  date: "2026-05-21",
  title: "今日の振り返り",
  content:
    "朝のルーティンを全て完了できた。集中できた時間が長く、生産性が高かった。\n\n明日は早起きしてランニングから始めたい。",
  createdAt: "2026-05-21T21:00:00+09:00",
  updatedAt: "2026-05-21T21:00:00+09:00",
};

export const NoEntry: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: false,
    titleInput: "",
    contentInput: "",
  },
};

export const ShowingNewForm: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "",
    contentInput: "",
  },
};

export const WritingEntry: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "今日の振り返り",
    contentInput: "充実した一日だった。",
  },
};

export const WithEntry: Story = {
  args: {
    todayEntry,
    editingEntry: null,
    showForm: false,
    titleInput: "",
    contentInput: "",
  },
};

export const EditingEntry: Story = {
  args: {
    todayEntry,
    editingEntry: todayEntry,
    showForm: true,
    titleInput: todayEntry.title,
    contentInput: todayEntry.content,
  },
};
