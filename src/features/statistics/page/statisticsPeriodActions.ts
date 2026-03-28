import type { Dispatch, SetStateAction } from "react";
import type { ViewMode } from "./types";

type SetCurrentDate = Dispatch<SetStateAction<Date>>;

export const createStatisticsPreviousPeriodAction = (params: {
  viewMode: ViewMode;
  currentDate: Date;
  year: number;
  month: number;
  setCurrentDate: SetCurrentDate;
}) => {
  const { viewMode, currentDate, year, month, setCurrentDate } = params;

  return () => {
    if (viewMode === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
      return newDate;
    }

    const newDate = new Date(year, month - 2, 1);
    setCurrentDate(newDate);
    return newDate;
  };
};

export const createStatisticsNextPeriodAction = (params: {
  viewMode: ViewMode;
  currentDate: Date;
  year: number;
  month: number;
  setCurrentDate: SetCurrentDate;
}) => {
  const { viewMode, currentDate, year, month, setCurrentDate } = params;

  return () => {
    if (viewMode === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
      return newDate;
    }

    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate);
    return newDate;
  };
};

export const createStatisticsTodayAction = (setCurrentDate: SetCurrentDate) => {
  return () => {
    const today = new Date();
    setCurrentDate(today);
    return today;
  };
};
