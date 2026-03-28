import type { Dispatch, SetStateAction } from "react";
import type { DailyHistory } from "@/types/routine";
import { selectAchievementCalendarDate } from "./achievementCalendarStateActions";

type CalendarSelectionSetters = {
  setSelectedDate: Dispatch<SetStateAction<string | null>>;
  setSelectedHistory: Dispatch<SetStateAction<DailyHistory | null>>;
};

const applyCalendarSelection = (
  state: {
    selectedDate: string | null;
    selectedHistory: DailyHistory | null;
  },
  setters: CalendarSelectionSetters,
): void => {
  setters.setSelectedDate(state.selectedDate);
  setters.setSelectedHistory(state.selectedHistory);
};

export const createAchievementCalendarDateClickHandler = (args: {
  getDailyHistory: (dateStr: string) => DailyHistory | null;
  setters: CalendarSelectionSetters;
}) => {
  const { getDailyHistory, setters } = args;

  return (dateStr: string) => {
    applyCalendarSelection(
      selectAchievementCalendarDate(dateStr, getDailyHistory(dateStr)),
      setters,
    );
  };
};
