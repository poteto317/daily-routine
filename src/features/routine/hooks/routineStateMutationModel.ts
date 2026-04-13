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

  // completedRoutineIds を Set に変換して O(1) ルックアップを保証
  const completedSet = completedRoutineIds
    ? new Set(completedRoutineIds)
    : undefined;

  const repaired: Routine[] = [...nonGrouped];

  for (const members of groups.values()) {
    // 全メンバーの曜日をフラットに集める
    const allDays = members.flatMap((m) => m.daysOfWeek);
    const uniqueDays = [...new Set(allDays)].sort((a, b) => a - b);

    // テンプレート: 最初のメンバーを基準にする
    const template = members[0]!;

    // day -> クリーンメンバー候補 の Map を事前構築（ループ内の毎回 filter を回避）
    const cleanByDay = new Map<number, Routine[]>();
    for (const m of members) {
      if (m.daysOfWeek.length === 1) {
        const day = m.daysOfWeek[0]!;
        const list = cleanByDay.get(day);
        if (list) {
          list.push(m);
        } else {
          cleanByDay.set(day, [m]);
        }
      }
    }

    // 汚染されたメンバーをプール化して順に再利用する。
    // completedSet のメンバーを先頭に置き、次に sortOrder で安定ソートすることで
    // 「どの曜日にどの既存IDが割り当てられるか」を決定的にする。
    // これにより getRoutines() の返却順序に依存せず、完了済み ID が優先して
    // 若い曜日番号に割り当てられる（進捗参照を最大限保護）。
    const dirtyMembers = members
      .filter((m) => m.daysOfWeek.length > 1)
      .sort((a, b) => {
        const aCompleted = completedSet?.has(a.id) ? 0 : 1;
        const bCompleted = completedSet?.has(b.id) ? 0 : 1;
        if (aCompleted !== bCompleted) return aCompleted - bCompleted;
        const sortOrderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
        if (sortOrderDiff !== 0) return sortOrderDiff;
        return a.id.localeCompare(b.id);
      });
    let dirtyMemberIndex = 0;

    const seenDays = new Set<number>();
    for (const day of uniqueDays) {
      if (seenDays.has(day)) continue;
      seenDays.add(day);

      // この曜日に対応する既存メンバーを探す（Map から O(1) 取得）
      // completedSet がある場合は完了済みエントリを優先して残す（進捗参照を保護）
      const cleanCandidates = cleanByDay.get(day) ?? [];
      const existing =
        completedSet && cleanCandidates.length > 1
          ? (cleanCandidates.find((m) => completedSet.has(m.id)) ??
            cleanCandidates[0])
          : cleanCandidates[0];

      if (existing) {
        repaired.push(existing);
      } else {
        // 汚染メンバーの ID を順に再利用し、不足時のみ新規生成する。
        // ID を再利用する場合は「既存レコードの修復」とみなし createdAt を保持する。
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
    [...repaired].sort((a, b) => {
      const sortOrderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
      if (sortOrderDiff !== 0) return sortOrderDiff;
      return a.id.localeCompare(b.id);
    }),
  );
};
