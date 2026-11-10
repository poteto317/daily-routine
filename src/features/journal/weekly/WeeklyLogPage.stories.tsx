import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WeeklyLogPage } from "./WeeklyLogPage";
import { saveWeeklyLogHistory } from "./weeklyLogStorage";
import type { WeeklyLogHistory } from "@/types/routine";

// WeeklyLogPage は useWeeklyLogState() を内部で呼び出す。
// localStorage（weekly-log-history キー）からデータを読み込む。
// beforeEach で saveWeeklyLogHistory() を使いデータを設定し、後始末で空に戻す。

const meta = {
  title: "Features/Journal/WeeklyLogPage",
  component: WeeklyLogPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WeeklyLogPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleHistory: WeeklyLogHistory = {
  "2026-11-02": {
    id: "w-1",
    weekStart: "2026-11-02",
    content: "・A 案件の設計レビューを完了\n・来週は実装に着手",
    createdAt: "2026-11-06T09:00:00.000Z",
    updatedAt: "2026-11-06T09:30:00.000Z",
  },
  "2026-10-26": {
    id: "w-2",
    weekStart: "2026-10-26",
    content: "・B 案件のリリース対応\n・障害の振り返り会を実施",
    createdAt: "2026-10-31T09:00:00.000Z",
    updatedAt: "2026-10-31T09:00:00.000Z",
  },
};

export const Default: Story = {
  beforeEach() {
    saveWeeklyLogHistory({});
    return () => saveWeeklyLogHistory({});
  },
};

export const WithEntries: Story = {
  beforeEach() {
    saveWeeklyLogHistory(sampleHistory);
    return () => saveWeeklyLogHistory({});
  },
};

/** 狭い幅（Storybook の mobile1 = 320px）でも週ナビと一覧が崩れないこと */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  beforeEach() {
    saveWeeklyLogHistory(sampleHistory);
    return () => saveWeeklyLogHistory({});
  },
};
