import { toJstTime } from "./jstDateTime";

/** 今の時刻（JST）。日付キーと同じ基準で求める */
export const getCurrentTime = (): string => toJstTime(new Date());

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/**
 * 指定時刻を過ぎたか（JST 基準）。
 *
 * Date の setHours で比べると端末のタイムゾーンが混ざり、日付をまたぐ
 * 計算も絡む。JST の時刻を分に直して比べるだけにする。
 */
export const isTimePassed = (
  targetTime: string,
  minutesAfter: number = 0,
): boolean => {
  return (
    timeToMinutes(getCurrentTime()) >= timeToMinutes(targetTime) + minutesAfter
  );
};
