import type { Routine } from "@/types/routine";

/** groupId ごとのメンバーと、groupId を持たないルーティンに分けた結果 */
export type RoutinesByGroup = {
  groups: Map<string, Routine[]>;
  nonGrouped: Routine[];
};

/** ルーティンを groupId ごとにまとめる（グループの順番は最初に現れた順） */
export const groupRoutinesByGroupId = (
  routines: Routine[],
): RoutinesByGroup => {
  const groups = new Map<string, Routine[]>();
  const nonGrouped: Routine[] = [];

  for (const routine of routines) {
    if (!routine.groupId) {
      nonGrouped.push(routine);
      continue;
    }
    const members = groups.get(routine.groupId);
    if (members) {
      members.push(routine);
    } else {
      groups.set(routine.groupId, [routine]);
    }
  }

  return { groups, nonGrouped };
};

/**
 * グループのデータが汚染されているかを判定する。
 *
 * 汚染パターン:
 * 1. メンバーの daysOfWeek が [1,3,5] のように複数曜日になっている（本来は [1] のように単一）
 * 2. 同一グループ内に同じ曜日のメンバーが重複している
 */
export const isCorruptedGroup = (members: Routine[]): boolean => {
  if (members.some((member) => member.daysOfWeek.length > 1)) {
    return true;
  }
  const seenDays = new Set<number>();
  for (const member of members) {
    for (const day of member.daysOfWeek) {
      if (seenDays.has(day)) return true;
      seenDays.add(day);
    }
  }
  return false;
};
