import { FIXED_HOLIDAYS, HAPPY_MONDAYS } from "./constants";
import { getNthMonday, getShuubunDate, getShunbunDate } from "./calculators";

export const isHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  const monthDay = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (FIXED_HOLIDAYS[monthDay]) return true;

  if (month === 3 && day === getShunbunDate(year)) return true;

  if (month === 9 && day === getShuubunDate(year)) return true;

  for (const happyMonday of HAPPY_MONDAYS) {
    if (month === happyMonday.month && dayOfWeek === 1) {
      const nthMonday = getNthMonday(year, month, happyMonday.week);
      if (day === nthMonday) return true;
    }
  }

  if (dayOfWeek === 1) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.getDay() === 0 && isHoliday(yesterday)) return true;
  }

  return false;
};

export const isWeekday = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5 && !isHoliday(date);
};

export const isWeekend = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return (dayOfWeek === 0 || dayOfWeek === 6) && !isHoliday(date);
};

export const getDateType = (date: Date): "weekday" | "weekend" | "holiday" => {
  if (isHoliday(date)) {
    return "holiday";
  }

  if (isWeekend(date)) {
    return "weekend";
  }

  return "weekday";
};
