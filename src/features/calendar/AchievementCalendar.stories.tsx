import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { saveMonthlyHistory } from "@/features/routine";
import { savePomodoroHistory } from "@/features/pomodoro";
import { AchievementCalendar } from "./AchievementCalendar";

// AchievementCalendar は useAchievementCalendarState() を内部で呼び出す。
// useState(new Date()) で表示中の年月を初期化するため、固定日付のフィクスチャでは
// 閲覧時期によって達成セルがヒットしない。
// WithHistory では当月内の直近日付を動的に生成してハイライトが常に表示されるようにする。
// 月初（1日・2日）に実行しても前月に入らないよう 1 日をクランプ下限にする。

// JST の当月内で daysAgo 前の日を返す（月初をまたがないよう 1 日をクランプ下限にする）。
// これにより月初（1日・2日）でも前月に入らず、常に当月のセルがハイライトされる。
const getJstCurrentMonthDateString = (daysAgo = 0): string => {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const year = jst.getUTCFullYear();
  const month = jst.getUTCMonth() + 1;
  const day = Math.max(1, jst.getUTCDate() - daysAgo);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

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
    const yesterday = getJstCurrentMonthDateString(1);
    const twoDaysAgo = getJstCurrentMonthDateString(2);
    saveMonthlyHistory({
      [yesterday]: {
        date: yesterday,
        completedRoutineIds: ["r-1", "r-2"],
        routineSnapshots: [
          {
            id: "r-1",
            title: "朝のストレッチ",
            category: "health",
            startTime: "07:00",
          },
          {
            id: "r-2",
            title: "英語学習",
            category: "study",
            startTime: "06:30",
          },
        ],
      },
      [twoDaysAgo]: {
        date: twoDaysAgo,
        completedRoutineIds: ["r-1"],
        routineSnapshots: [
          {
            id: "r-1",
            title: "朝のストレッチ",
            category: "health",
            startTime: "07:00",
          },
        ],
      },
    });
    savePomodoroHistory({
      [yesterday]: { date: yesterday, completedPomodoros: 3 },
      [twoDaysAgo]: { date: twoDaysAgo, completedPomodoros: 1 },
    });
    return () => {
      saveMonthlyHistory({});
      savePomodoroHistory({});
    };
  },
};
