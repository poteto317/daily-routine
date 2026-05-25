import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { savePomodoroHistory } from "@/features/pomodoro";
import { PomodoroPage } from "./PomodoroPage";
import { samplePomodoroHistory } from "./__fixtures__/pomodoroFixtures";

// PomodoroPage は usePomodoroTimer() を内部で呼び出す。
// localStorage が空のとき初期状態（今日0件・タイマー停止）で描画される。
// WithPomodoros では過去セッションを beforeEach で設定して完了数付きの状態を表示する。

const meta = {
  title: "Features/Pomodoro/PomodoroPage",
  component: PomodoroPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PomodoroPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach() {
    savePomodoroHistory({});
    return () => savePomodoroHistory({});
  },
};

export const WithPomodoros: Story = {
  beforeEach() {
    savePomodoroHistory(samplePomodoroHistory);
    return () => savePomodoroHistory({});
  },
};
