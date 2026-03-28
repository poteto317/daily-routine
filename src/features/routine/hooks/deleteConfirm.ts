import { Routine } from "@/types/routine";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

/** ルーティン削除の確認ダイアログを表示し、結果を返す */
export const confirmDeleteRoutine = (
  routine: Routine,
  allRoutines: Routine[],
): boolean => {
  const group = routine.groupId
    ? allRoutines.filter((r) => r.groupId === routine.groupId)
    : [routine];
  const days = group.map((r) => DAY_NAMES[r.daysOfWeek[0]]).join(", ");
  const message =
    group.length > 1
      ? `「${routine.title}」(${days})を削除してもよろしいですか？`
      : `このルーティンを削除してもよろしいですか？`;
  return confirm(message);
};
