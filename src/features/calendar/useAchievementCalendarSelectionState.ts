import { useState } from "react";
import type { DailyHistory } from "@/types/routine";
import { createAchievementCalendarSelectionStateResult } from "./achievementCalendarSelectionStateResult";

export const useAchievementCalendarSelectionState = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<DailyHistory | null>(
    null,
  );

  return createAchievementCalendarSelectionStateResult({
    currentDate,
    selectedDate,
    selectedHistory,
    setCurrentDate,
    setSelectedDate,
    setSelectedHistory,
  });
};
