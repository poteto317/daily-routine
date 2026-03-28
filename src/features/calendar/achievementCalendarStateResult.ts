import type { DailyHistory, PomodoroHistory } from "@/types/routine";

type AchievementCalendarStateResultArgs = {
  year: number;
  month: number;
  monthHistory: Record<string, DailyHistory>;
  pomodoroHistory: PomodoroHistory;
  selectedDate: string | null;
  selectedHistory: DailyHistory | null;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  goToToday: () => void;
  handleDateClick: (dateStr: string) => void;
};

export const createAchievementCalendarStateResult = ({
  year,
  month,
  monthHistory,
  pomodoroHistory,
  selectedDate,
  selectedHistory,
  goToNextMonth,
  goToPreviousMonth,
  goToToday,
  handleDateClick,
}: AchievementCalendarStateResultArgs) => {
  return {
    year,
    month,
    monthHistory,
    pomodoroHistory,
    selectedDate,
    selectedHistory,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    handleDateClick,
  };
};
