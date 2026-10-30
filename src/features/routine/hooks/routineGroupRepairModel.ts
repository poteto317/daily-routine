import type { Routine } from "@/types/routine";

import {
  groupRoutinesByGroupId,
  isCorruptedGroup,
} from "./routineGroupCorruption";
import { repairGroupMembers } from "./routineGroupDayRepair";
import { assignSortOrder, compareBySortOrderThenId } from "./routineOrderModel";

export { migrateMultiDayRoutinesWithGroup } from "./routineGroupMultiDayMigration";

/**
 * 汚染されたグループデータを修復する。
 *
 * 汚染パターン（判定は routineGroupCorruption.ts）:
 * 1. メンバーの daysOfWeek が [1,3,5] のように複数曜日になっている（本来は [1] のように単一）
 * 2. 同一 groupId 内に同じ曜日の重複エントリがある
 *
 * 修復: 1 つでも汚染されたグループがあれば、すべてのグループについて
 * 曜日ごとに 1 エントリだけ残し（routineGroupDayRepair.ts）、全体の sortOrder を振り直す。
 * 汚染がなければ元の配列をそのまま返す。
 *
 * @param completedRoutineIds 今日完了済みのルーティン id。残すメンバーを選ぶときに優先する
 */
export const repairCorruptedGroupRoutines = (
  routines: Routine[],
  completedRoutineIds?: string[],
): Routine[] => {
  const { groups, nonGrouped } = groupRoutinesByGroupId(routines);
  const needsRepair = [...groups.values()].some(isCorruptedGroup);
  if (!needsRepair) return routines;

  const completedSet = completedRoutineIds
    ? new Set(completedRoutineIds)
    : undefined;
  const repaired = [
    ...nonGrouped,
    ...[...groups.values()].flatMap((members) =>
      repairGroupMembers(members, completedSet),
    ),
  ];

  return assignSortOrder(repaired.sort(compareBySortOrderThenId));
};
