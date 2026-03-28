import { isFixedHoliday } from "./fixed-holiday";
import { isHappyMondayHoliday } from "./happy-monday-holiday";
import { isEquinoxHoliday } from "./equinox-holiday";

export const isJapaneseHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  if (isFixedHoliday(month, day)) {
    return true;
  }

  if (isHappyMondayHoliday(month, day, dayOfWeek)) {
    return true;
  }

  if (isEquinoxHoliday(year, month, day)) {
    return true;
  }

  return false;
};
