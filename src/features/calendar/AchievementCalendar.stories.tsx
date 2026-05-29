import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { saveMonthlyHistory } from "@/features/routine";
import { savePomodoroHistory } from "@/features/pomodoro";
import { AchievementCalendar } from "./AchievementCalendar";

// AchievementCalendar は useAchievementCalendarState() を内部で呼び出す。
// useState(new Date()) で表示中の年月を初期化するため、固定日付のフィクスチャでは
// 閲覧時期によって達成セルがヒットしない。
// WithHistory では直近の日付を動的に生成してハイライトが常に表示されるようにする。

// getTodayString() と同じく JST オフセットを加算して日付文字列を生成する。
const getJstDateString = (daysAgo = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
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
    const yesterday = getJstDateString(1);
    const twoDaysAgo = getJstDateString(2);
    saveMonthlyHistory({
      [yesterday]: {
        date: yesterday,
        completedRoutineIds: ["r-1", "r-2"],
        routineSnapshots: [
          { id: "r-1", title: "朝のストレッチ", category: "health", startTime: "07:00" },
          { id: "r-2", title: "英語学習", category: "study", startTime: "06:30" },
        ],
      },
      [twoDaysAgo]: {
        date: twoDaysAgo,
        completedRoutineIds: ["r-1"],
        routineSnapshots: [
          { id: "r-1", title: "朝のストレッチ", category: "health", startTime: "07:00" },
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
