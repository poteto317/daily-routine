import type { Dispatch, SetStateAction } from "react";
import type { DailyHistory } from "@/types/routine";

type CreateAchievementCalendarSelectionStateResultArgs = {
  currentDate: Date;
  selectedDate: string | null;
  selectedHistory: DailyHistory | null;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  setSelectedDate: Dispatch<SetStateAction<string | null>>;
  setSelectedHistory: Dispatch<SetStateAction<DailyHistory | null>>;
};

export const createAchievementCalendarSelectionStateResult = ({
  currentDate,
  selectedDate,
  selectedHistory,
  setCurrentDate,
  setSelectedDate,
  setSelectedHistory,
}: CreateAchievementCalendarSelectionStateResultArgs) => {
  return {
    currentDate,
    selectedDate,
    selectedHistory,
    setCurrentDate,
    setSelectedDate,
    setSelectedHistory,
  };
};
