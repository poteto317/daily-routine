import type { Routine } from "@/types/routine";

import { assignSortOrder } from "./routineOrderModel";

export const migrateMultiDayRoutinesWithGroup = (
  routines: Routine[],
): Routine[] => {
  const migratedRoutines: Routine[] = [];
  let maxSortOrder = Math.max(
    ...routines.map((routine) => routine.sortOrder || 0),
    0,
  );

  routines.forEach((routine) => {
    const groupId = routine.groupId || routine.id;
    if (routine.daysOfWeek.length <= 1) {
      migratedRoutines.push({ ...routine, groupId });
      return;
    }

    routine.daysOfWeek.forEach((day, index) => {
      migratedRoutines.push({
        ...routine,
        id: index === 0 ? routine.id : crypto.randomUUID(),
        groupId,
        daysOfWeek: [day],
        sortOrder: index === 0 ? routine.sortOrder : ++maxSortOrder,
        isCompleted: false,
      });
    });
  });

  return migratedRoutines;
};

/**
 * 汚染されたグループデータを修復する。
 *
 * 汚染パターン:
 * 1. メンバーの daysOfWeek が [1,3,5] のように複数曜日になっている（本来は [1] のように単一）
 * 2. 同一 groupId 内に同じ曜日の重複エントリがある
 *
 * 修復: 各グループについて、メンバーのユニーク曜日を求め、
 * 曜日ごとに1エントリだけ残す。汚染がなければ元の配列をそのまま返す。
 */
export const repairCorruptedGroupRoutines = (
  routines: Routine[],
  completedRoutineIds?: string[],
): Routine[] => {
  const groups = new Map<string, Routine[]>();
  const nonGrouped: Routine[] = [];

  for (const routine of routines) {
    if (!routine.groupId) {
      nonGrouped.push(routine);
      continue;
    }
    const list = groups.get(routine.groupId);
    if (list) {
      list.push(routine);
    } else {
      groups.set(routine.groupId, [routine]);
    }
  }

  let needsRepair = false;

  for (const members of groups.values()) {
    if (members.some((member) => member.daysOfWeek.length > 1)) {
      needsRepair = true;
      break;
    }
    const daySet = new Set<number>();
    for (const member of members) {
      for (const day of member.daysOfWeek) {
        if (daySet.has(day)) {
          needsRepair = true;
          break;
        }
        daySet.add(day);
      }
      if (needsRepair) break;
    }
    if (needsRepair) break;
  }

  if (!needsRepair) return routines;

  const completedSet = completedRoutineIds
    ? new Set(completedRoutineIds)
    : undefined;
  const repaired: Routine[] = [...nonGrouped];

  for (const members of groups.values()) {
    const allDays = members.flatMap((member) => member.daysOfWeek);
    const uniqueDays = [...new Set(allDays)].sort(
      (left, right) => left - right,
    );
    const template = members[0]!;

    const cleanByDay = new Map<number, Routine[]>();
    for (const member of members) {
      if (member.daysOfWeek.length === 1) {
        const day = member.daysOfWeek[0]!;
        const list = cleanByDay.get(day);
        if (list) {
          list.push(member);
        } else {
          cleanByDay.set(day, [member]);
        }
      }
    }

    const dirtyMembers = members
      .filter((member) => member.daysOfWeek.length > 1)
      .sort((left, right) => {
        const leftCompleted = completedSet?.has(left.id) ? 0 : 1;
        const rightCompleted = completedSet?.has(right.id) ? 0 : 1;
        if (leftCompleted !== rightCompleted) {
          return leftCompleted - rightCompleted;
        }
        const sortOrderDiff = (left.sortOrder || 0) - (right.sortOrder || 0);
        if (sortOrderDiff !== 0) return sortOrderDiff;
        return left.id.localeCompare(right.id);
      });
    let dirtyMemberIndex = 0;

    const seenDays = new Set<number>();
    for (const day of uniqueDays) {
      if (seenDays.has(day)) continue;
      seenDays.add(day);

      const cleanCandidates = cleanByDay.get(day) ?? [];
      const existing =
        completedSet && cleanCandidates.length > 1
          ? (cleanCandidates.find((member) => completedSet.has(member.id)) ??
            cleanCandidates[0])
          : cleanCandidates[0];

      if (existing) {
        repaired.push(existing);
      } else {
        const recycledMember =
          dirtyMemberIndex < dirtyMembers.length
            ? dirtyMembers[dirtyMemberIndex++]!
            : undefined;
        const now = new Date().toISOString();
        repaired.push({
          ...template,
          id: recycledMember?.id ?? crypto.randomUUID(),
          daysOfWeek: [day],
          sortOrder: (template.sortOrder || 0) + seenDays.size - 1,
          createdAt: recycledMember?.createdAt ?? now,
          updatedAt: now,
        });
      }
    }
  }

  return assignSortOrder(
    [...repaired].sort((left, right) => {
      const sortOrderDiff = (left.sortOrder || 0) - (right.sortOrder || 0);
      if (sortOrderDiff !== 0) return sortOrderDiff;
      return left.id.localeCompare(right.id);
    }),
  );
};
