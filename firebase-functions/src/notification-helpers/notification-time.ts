import { type Routine } from "../types";

/**
 * ルーティンの通知時刻を求める。
 * 開始時刻（HH:mm）に notificationMinutes（開始の何分後か）を足し、24 時を超えたら折り返す。
 */
export const calculateNotificationTime = (
  routine: Routine,
): { hour: number; minute: number } => {
  const [routineHour, routineMinute] = routine.startTime.split(":").map(Number);
  const notificationMinutes = routine.notificationMinutes || 0;
  const totalMinutes = routineHour * 60 + routineMinute + notificationMinutes;
  const notificationHour = Math.floor(totalMinutes / 60) % 24;
  const notificationMinute = totalMinutes % 60;

  return { hour: notificationHour, minute: notificationMinute };
};

/** 現在の時・分がルーティンの通知時刻と一致するか判定する */
export const isNotificationTimeNow = (
  routine: Routine,
  currentHour: number,
  currentMinute: number,
): boolean => {
  const { hour, minute } = calculateNotificationTime(routine);
  return currentHour === hour && currentMinute === minute;
};
