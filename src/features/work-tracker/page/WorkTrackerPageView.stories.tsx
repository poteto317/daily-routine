import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { saveWorkSessionHistory } from "@/features/work-tracker/storage";
import { WorkTrackerPage } from "./WorkTrackerPageView";
import { sampleSessionHistory } from "./__fixtures__/workSessionFixtures";

// WorkTrackerPage は useWorkTrackerPageState() を内部で呼び出す。
// localStorage が空のとき初期状態（セッション履歴なし・タイマー停止）で描画される。
// WithHistory では過去セッションを beforeEach で設定してセッション履歴付きの状態を表示する。

const meta = {
  title: "Features/WorkTracker/WorkTrackerPage",
  component: WorkTrackerPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WorkTrackerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach() {
    saveWorkSessionHistory({});
    return () => saveWorkSessionHistory({});
  },
};

export const WithHistory: Story = {
  beforeEach() {
    saveWorkSessionHistory(sampleSessionHistory);
    return () => saveWorkSessionHistory({});
  },
};
