import { useAchievementCalendarActions } from "./useAchievementCalendarActions";
import { useAchievementCalendarData } from "./useAchievementCalendarData";
import { useAchievementCalendarSelectionState } from "./useAchievementCalendarSelectionState";
import { createAchievementCalendarStateResult } from "./achievementCalendarStateResult";

export const useAchievementCalendarState = () => {
  const {
    currentDate,
    selectedDate,
    selectedHistory,
    setCurrentDate,
    setSelectedDate,
    setSelectedHistory,
  } = useAchievementCalendarSelectionState();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const { getDailyHistory, monthHistory, pomodoroHistory } =
    useAchievementCalendarData(year, month);
  const actions = useAchievementCalendarActions({
    year,
    month,
    getDailyHistory,
    setCurrentDate,
    setSelectedDate,
    setSelectedHistory,
  });

  return createAchievementCalendarStateResult({
    month,
    monthHistory,
    pomodoroHistory,
    selectedDate,
    selectedHistory,
    year,
    ...actions,
  });
};
