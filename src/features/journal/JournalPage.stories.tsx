import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { JournalPage } from "./JournalPage";
import { saveJournalHistory } from "./storage";
import type { JournalHistory } from "@/types/routine";

// JournalPage は useJournalPageState() を内部で呼び出す。
// localStorage（journal-history キー）からデータを読み込む。
// beforeEach で saveJournalHistory() を使いデータを設定する。

const meta = {
  title: "Features/Journal/JournalPage",
  component: JournalPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof JournalPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleHistory: JournalHistory = {
  "2026-05-29": [
    {
      id: "j-1",
      date: "2026-05-29",
      title: "今日の振り返り",
      content:
        "Storybookのストーリーを整備した。UI カバレッジが増えてよかった。",
      createdAt: "2026-05-29T22:00:00+09:00",
      updatedAt: "2026-05-29T22:00:00+09:00",
    },
  ],
  "2026-05-28": [
    {
      id: "j-2",
      date: "2026-05-28",
      title: "昨日のメモ",
      content: "新機能の実装を開始した。",
      createdAt: "2026-05-28T21:00:00+09:00",
      updatedAt: "2026-05-28T21:00:00+09:00",
    },
  ],
};

export const Default: Story = {
  beforeEach() {
    saveJournalHistory({});
    return () => saveJournalHistory({});
  },
};

export const WithEntries: Story = {
  beforeEach() {
    saveJournalHistory(sampleHistory);
    return () => saveJournalHistory({});
  },
};

/** ➕ボタンをクリック → 日記入力フォームが開く */
export const ClickAdd: Story = {
  beforeEach() {
    saveJournalHistory({});
    return () => saveJournalHistory({});
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: "➕" });
    await userEvent.click(addButton);
    expect(canvas.getByRole("textbox")).toBeTruthy();
  },
};
