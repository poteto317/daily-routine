import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { saveWorkSessionHistory } from "@/features/work-tracker/storage";
import { WorkTrackerPage } from "./WorkTrackerPageView";

// WorkTrackerPage は useWorkTrackerPageState() を内部で呼び出す。
// localStorage が空のとき初期状態（セッション履歴なし・タイマー停止）で描画される。
// WithHistory では過去セッションを beforeEach で設定してセッション履歴付きの状態を表示する。

const sessionHistory = {
  "2026-05-22": [
    {
      id: "s-1",
      workTemplateId: "",
      workName: "コーディング",
      mood: "good" as const,
      startTime: "2026-05-22T09:00:00+09:00",
      endTime: "2026-05-22T10:30:00+09:00",
      duration: 5400,
      notes: "集中できた",
      createdAt: "2026-05-22T09:00:00+09:00",
    },
    {
      id: "s-2",
      workTemplateId: "",
      workName: "ドキュメント作成",
      mood: "normal" as const,
      startTime: "2026-05-22T11:00:00+09:00",
      endTime: "2026-05-22T12:00:00+09:00",
      duration: 3600,
      notes: undefined,
      createdAt: "2026-05-22T11:00:00+09:00",
    },
  ],
};

const meta = {
  title: "Features/WorkTracker/WorkTrackerPage",
  component: WorkTrackerPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WorkTrackerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHistory: Story = {
  beforeEach() {
    saveWorkSessionHistory(sessionHistory);
    return () => saveWorkSessionHistory({});
  },
};
