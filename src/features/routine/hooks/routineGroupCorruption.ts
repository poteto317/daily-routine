import type { Routine } from "@/types/routine";

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
