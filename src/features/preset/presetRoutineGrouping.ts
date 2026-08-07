import type { Routine } from "@/types/routine";
import { buildRoutineIdentityKey } from "./presetRoutineIdentity";

export type RoutineSelectionGroup = {
  key: string;
  routine: Routine;
  routineIds: string[];
  daysOfWeek: number[];
};

/**
 * ルーティン選択リスト用に、種目名(title)と時刻(startTime)が一致するものを
 * 1グループへ統合する。複数曜日で作成されたルーティンは曜日ごとに別レコード
 * （id違い・title/startTime同一）として保存されているため、選択UI上では
 * 同じ内容が曜日の数だけ重複表示されてしまう問題に対応する。
 *
 * 代表ルーティン(routine)は配列内で最初に出現したものを採用し、
 * daysOfWeekはグループ内全メンバーの和集合とする。
 */
export const groupRoutinesForSelection = (
  routines: Routine[],
): RoutineSelectionGroup[] => {
  const groups = new Map<string, RoutineSelectionGroup>();

  for (const routine of routines) {
    const key = buildRoutineIdentityKey(routine.title, routine.startTime);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        key,
        routine,
        routineIds: [routine.id],
        daysOfWeek: [...routine.daysOfWeek],
      });
      continue;
    }

    existing.routineIds.push(routine.id);
    for (const day of routine.daysOfWeek) {
      if (!existing.daysOfWeek.includes(day)) {
        existing.daysOfWeek.push(day);
      }
    }
  }

  return Array.from(groups.values());
};
