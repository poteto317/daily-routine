import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
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
    dateInput: null,
    onCancel: fn(),
    onContentChange: fn(),
    onDateChange: fn(),
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

/** 「➕」ボタンをクリック → onOpenForm が呼ばれる */
export const ClickAdd: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: false,
    titleInput: "",
    contentInput: "",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: "➕" });
    await userEvent.click(addButton);
    expect(args.onOpenForm).toHaveBeenCalledOnce();
  },
};

/** 本文を入力 → onContentChange が呼ばれる */
export const TypeContent: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "",
    contentInput: "",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const contentInput = canvas.getByPlaceholderText(/今日感じたこと/);
    await userEvent.type(contentInput, "今日も充実した一日だった。");
    expect(args.onContentChange).toHaveBeenCalled();
  },
};

/** 「保存」ボタンをクリック → onSave が呼ばれる */
export const ClickSaveNew: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "今日のメモ",
    contentInput: "充実した一日",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole("button", { name: "保存" });
    await userEvent.click(saveButton);
    expect(args.onSave).toHaveBeenCalledOnce();
  },
};

/** 新規追加で過去の日付を選んだとき → 見出しが「<日付> の記録」になる */
export const NewEntryPastDate: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "昨日の振り返り",
    contentInput: "日付をまたいでから書いた。",
    dateInput: "2026-05-20",
  },
};

/** 新規追加で日付欄を空にしたとき → 見出しは「今日の記録」だけ */
export const NewEntryEmptyDate: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "",
    contentInput: "",
    dateInput: "",
  },
};

/** 今日の記録を編集中に日付を変えたとき → 見出しは今日のまま */
export const EditingEntryDateChanged: Story = {
  args: {
    todayEntry,
    editingEntry: todayEntry,
    showForm: true,
    titleInput: todayEntry.title,
    contentInput: todayEntry.content,
    dateInput: "2026-05-18",
  },
};

/** 日付欄を変更 → onDateChange が選んだ値で呼ばれる */
export const ChangeDate: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "",
    contentInput: "",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByLabelText("日付"), {
      target: { value: "2026-05-19" },
    });
    expect(args.onDateChange).toHaveBeenCalledWith("2026-05-19");
  },
};
