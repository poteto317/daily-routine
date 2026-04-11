import type { Routine } from "@/types/routine";

export type RoutineCreateInput = Omit<
  Routine,
  "id" | "createdAt" | "updatedAt"
>;

export type RoutineBatchCreateInput = Omit<
  Routine,
  "id" | "sortOrder" | "createdAt" | "updatedAt"
>;

const getMaxSortOrder = (routines: Routine[]): number => {
  return routines.length > 0
    ? Math.max(...routines.map((routine) => routine.sortOrder || 0))
    : -1;
};

export const sortRoutinesByOrder = (routines: Routine[]): Routine[] => {
  return [...routines].sort(
    (left, right) => (left.sortOrder || 0) - (right.sortOrder || 0),
  );
};

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

export const createRoutinesForSingleInput = (
  previousRoutines: Routine[],
  routine: RoutineCreateInput,
): Routine[] => {
  const maxSortOrder = getMaxSortOrder(previousRoutines);
  const now = new Date().toISOString();
  const groupId = crypto.randomUUID();

  return routine.daysOfWeek.map((day, index) => ({
    ...routine,
    id: crypto.randomUUID(),
    groupId,
    daysOfWeek: [day],
    sortOrder: maxSortOrder + 1 + index,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  }));
};

export const createRoutinesForBatchInput = (
  previousRoutines: Routine[],
  routines: RoutineBatchCreateInput[],
): Routine[] => {
  let sortOrder = getMaxSortOrder(previousRoutines) + 1;
  const now = new Date().toISOString();

  return routines.flatMap((routine) => {
    const daysToCreate =
      routine.daysOfWeek.length > 0 ? routine.daysOfWeek : [1, 2, 3, 4, 5];
    const groupId = crypto.randomUUID();
    const created = daysToCreate.map((day, index) => ({
      ...routine,
      id: crypto.randomUUID(),
      groupId,
      daysOfWeek: [day],
      sortOrder: sortOrder + index,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    }));
    sortOrder += created.length;
    return created;
  });
};

export const buildUpdatedRoutine = (
  routine: Routine,
  updates: Partial<Routine>,
  now: string,
): Routine => ({ ...routine, ...updates, updatedAt: now });

export const assignSortOrder = (routines: Routine[]): Routine[] => {
  return routines.map((routine, index) => ({ ...routine, sortOrder: index }));
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
    if (members.some((m) => m.daysOfWeek.length > 1)) {
      needsRepair = true;
      break;
    }
    const daySet = new Set<number>();
    for (const m of members) {
      for (const d of m.daysOfWeek) {
        if (daySet.has(d)) {
          needsRepair = true;
          break;
        }
        daySet.add(d);
      }
      if (needsRepair) break;
    }
    if (needsRepair) break;
  }

  if (!needsRepair) return routines;

  const repaired: Routine[] = [...nonGrouped];

  for (const members of groups.values()) {
    // 全メンバーの曜日をフラットに集める
    const allDays = members.flatMap((m) => m.daysOfWeek);
    const uniqueDays = [...new Set(allDays)].sort((a, b) => a - b);

    // テンプレート: 最初のメンバーを基準にする
    const template = members[0]!;

    const seenDays = new Set<number>();
    for (const day of uniqueDays) {
      if (seenDays.has(day)) continue;
      seenDays.add(day);

      // この曜日に対応する既存メンバーを探す（元データ優先）
      const existing = members.find(
        (m) => m.daysOfWeek.length === 1 && m.daysOfWeek[0] === day,
      );

      if (existing) {
        repaired.push(existing);
      } else {
        // 汚染されたメンバーから修復エントリを生成
        const now = new Date().toISOString();
        repaired.push({
          ...template,
          id: crypto.randomUUID(),
          daysOfWeek: [day],
          sortOrder: template.sortOrder + seenDays.size - 1,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  return assignSortOrder(
    [...repaired].sort((a, b) => a.sortOrder - b.sortOrder),
  );
};
