import type { Routine } from "@/types/routine";

/**
 * 旧形式（1 件のルーティンが複数曜日を持つ）を、曜日ごとに 1 件へ分割する。
 *
 * - 分割したルーティンは元の groupId（無ければ元の id）でまとめる
 * - 1 件目は元の id と sortOrder を引き継ぎ、2 件目以降は新しい id と
 *   全ルーティンの最大 sortOrder（下限 0）に続く値を振る
 * - 分割したものは完了状態を外す。単一曜日のものは groupId を補うだけで他は変えない
 */
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
