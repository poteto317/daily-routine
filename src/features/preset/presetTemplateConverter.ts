import type { Routine, RoutineTemplate } from "@/types/routine";

/**
 * ルーティンをプリセット保存用のテンプレートへ変換する。
 * テンプレートは曜日やidを持たない雛形のため、該当フィールドは落とす。
 */
export const buildRoutineTemplatesFromRoutines = (
  routines: Routine[],
): RoutineTemplate[] => {
  return routines.map((routine) => ({
    title: routine.title,
    startTime: routine.startTime,
    duration: routine.duration,
    category: routine.category,
    description: routine.description,
    notificationMinutes: routine.notificationMinutes,
  }));
};
