import type { Routine } from "@/types/routine";
import { hasPresetRoutineCoreFields } from "./presetRoutineValidation";
import { isPresetSourceDay } from "./presetSourceDayValidation";

/**
 * プリセットの元曜日に属するルーティンを、開始時刻の昇順で返す。
 *
 * 保存済みデータが壊れていてもプリセット作成フローを壊さないよう、
 * daysOfWeek が配列でないルーティンは対象外にする。
 */
export const selectRoutinesForPresetSourceDay = (
  routines: Routine[],
  dayOfWeek: unknown,
): Routine[] => {
  if (!isPresetSourceDay(dayOfWeek)) return [];

  return routines
    .filter(
      (routine) =>
        hasPresetRoutineCoreFields(routine) &&
        Array.isArray(routine.daysOfWeek) &&
        routine.daysOfWeek.some(
          (routineDay) =>
            isPresetSourceDay(routineDay) && routineDay === dayOfWeek,
        ),
    )
    .sort((left, right) => left.startTime.localeCompare(right.startTime));
};
