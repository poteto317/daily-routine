import { type Routine, ROUTINE_CATEGORIES } from "@/types/routine";
import { timeToMinutes, toJstDay, toJstTime } from "@/lib/storage/core";
import { getSettings } from "@/features/settings/storage";

/**
 * 今日（JST）の曜日のルーティンで、開始時刻を過ぎているか。
 * 現在時刻は引数で受け取る（関数の中で時計を読むと、React Compiler のもとで
 * 呼び出し側のメモ化のキーに時刻が入らず、判定が最初の描画の値に固定される）。
 *
 * @param nowMs 判定に使う現在時刻（epoch ミリ秒）。描画時は useCurrentMinute() の値を渡す
 */
export const isRoutinePast = (routine: Routine, nowMs: number): boolean => {
  const now = new Date(nowMs);
  const isTodayRoutine = routine.daysOfWeek.includes(toJstDay(now));
  return (
    isTodayRoutine &&
    timeToMinutes(toJstTime(now)) > timeToMinutes(routine.startTime)
  );
};

export const getCategoryInfo = (routine: Pick<Routine, "category">) => {
  return (
    ROUTINE_CATEGORIES.find((cat) => cat.value === routine.category) ||
    ROUTINE_CATEGORIES[5]
  );
};

export const getRoutineCardStyle = (
  routine: Routine,
  isPast: boolean,
): string => {
  if (routine.isCompleted)
    return "bg-green-50 border-green-300 dark:bg-green-100 dark:border-green-400";
  if (isPast && !routine.isCompleted)
    return "bg-yellow-50 border-yellow-200 dark:bg-yellow-100 dark:border-yellow-300";
  return "bg-white border-gray-200 dark:bg-slate-100 dark:border-gray-300";
};

export const createSwipeHandler = (
  onEdit: (routine: Routine) => void,
  onDelete: (id: string) => void,
) => {
  return (routine: Routine) => {
    const settings = getSettings();
    if (settings.swipeAction === "delete") {
      onDelete(routine.id);
    } else {
      onEdit(routine);
    }
  };
};
