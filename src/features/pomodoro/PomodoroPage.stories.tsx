import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { savePomodoroHistory } from "@/features/pomodoro";
import { PomodoroPage } from "./PomodoroPage";

// PomodoroPage は usePomodoroTimer() を内部で呼び出す。
// localStorage が空のとき初期状態（今日0件・タイマー停止）で描画される。
// WithPomodoros では当日を含む直近2日分のセッションを beforeEach で設定して
// 「今日の完了数」が表示された状態を確認できる。

// getTodayString() と同じく JST オフセットを加算して日付文字列を生成する。
const getJstDateString = (daysAgo = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
};

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
    const today = getJstDateString(0);
    const yesterday = getJstDateString(1);
    savePomodoroHistory({
      [today]: { date: today, completedPomodoros: 3 },
      [yesterday]: { date: yesterday, completedPomodoros: 5 },
    });
    return () => savePomodoroHistory({});
  },
};
