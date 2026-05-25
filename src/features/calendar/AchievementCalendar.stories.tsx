import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { saveMonthlyHistory } from "@/features/routine";
import { savePomodoroHistory } from "@/features/pomodoro";
import { AchievementCalendar } from "./AchievementCalendar";
import {
  sampleCalendarPomodoroHistory,
  sampleMonthlyHistory,
} from "./__fixtures__/calendarFixtures";

// AchievementCalendar は useAchievementCalendarState() を内部で呼び出す。
// localStorage が空のとき空のカレンダー（達成記録なし）が表示される。
// WithHistory では月次達成履歴とポモドーロ履歴を beforeEach で設定して
// 達成セルがハイライトされた状態を表示する。

const meta = {
  title: "Features/Calendar/AchievementCalendar",
  component: AchievementCalendar,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AchievementCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach() {
    saveMonthlyHistory({});
    savePomodoroHistory({});
    return () => {
      saveMonthlyHistory({});
      savePomodoroHistory({});
    };
  },
};

export const WithHistory: Story = {
  beforeEach() {
    saveMonthlyHistory(sampleMonthlyHistory);
    savePomodoroHistory(sampleCalendarPomodoroHistory);
    return () => {
      saveMonthlyHistory({});
      savePomodoroHistory({});
    };
  },
};
