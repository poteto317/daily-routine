import type { Routine } from "@/types/routine";

import { compareBySortOrderThenId } from "./routineOrderModel";

/** 単一曜日のメンバーを曜日ごとにまとめる（各曜日内は元の順番） */
const indexSingleDayMembersByDay = (
  members: Routine[],
): Map<number, Routine[]> => {
  const byDay = new Map<number, Routine[]>();
  for (const member of members) {
    if (member.daysOfWeek.length !== 1) continue;
    const [day] = member.daysOfWeek;
    const list = byDay.get(day);
    if (list) {
      list.push(member);
    } else {
      byDay.set(day, [member]);
    }
  }
  return byDay;
};

/**
 * 複数曜日を持つメンバーを、空いた曜日の枠に再利用する順に並べる。
 * 今日完了済みのものを先に、次に sortOrder の昇順、同じなら id の昇順。
 */
const sortMultiDayMembersForReuse = (
  members: Routine[],
  completedSet: Set<string> | undefined,
): Routine[] => {
  const completedRank = (routine: Routine) =>
    completedSet?.has(routine.id) ? 0 : 1;
  return members
    .filter((member) => member.daysOfWeek.length > 1)
    .sort(
      (left, right) =>
        completedRank(left) - completedRank(right) ||
        compareBySortOrderThenId(left, right),
    );
};

/** 同じ曜日の候補から 1 件選ぶ。今日完了済みのものがあれば優先し、無ければ先頭 */
const pickSingleDayMember = (
  candidates: Routine[],
  completedSet: Set<string> | undefined,
): Routine | undefined =>
  (completedSet && candidates.find((member) => completedSet.has(member.id))) ??
  candidates[0];

/**
 * 1 つのグループのメンバーを、メンバーが持つ曜日ごとに 1 件だけになるよう作り直す。
 *
 * - その曜日の単一曜日メンバーがいれば、それを（今日完了済みを優先して）残す
 * - いなければ、複数曜日メンバーの id と createdAt を再利用して、その曜日だけのメンバーを作る
 * - 再利用できるメンバーも尽きたら、新しい id と現在時刻で作る
 *
 * 作り直したメンバーは先頭メンバーの内容を引き継ぎ、sortOrder は
 * 「先頭メンバーの sortOrder + 曜日の順番（昇順で 0 始まり）」にする。
 *
 * members が空のときは曜日が 1 つも無いため、先頭メンバーを参照せずに空配列を返す。
 */
export const repairGroupMembers = (
  members: Routine[],
  completedSet: Set<string> | undefined,
): Routine[] => {
  const [template] = members;
  const uniqueDays = [
    ...new Set(members.flatMap((member) => member.daysOfWeek)),
  ].sort((left, right) => left - right);
  const singleDayMembersByDay = indexSingleDayMembersByDay(members);
  const reusableMembers = sortMultiDayMembersForReuse(members, completedSet);
  let reusableIndex = 0;

  return uniqueDays.map((day, dayIndex) => {
    const existing = pickSingleDayMember(
      singleDayMembersByDay.get(day) ?? [],
      completedSet,
    );
    if (existing) return existing;

    const reused = reusableMembers[reusableIndex];
    if (reused) reusableIndex += 1;
    const now = new Date().toISOString();
    return {
      ...template,
      id: reused?.id ?? crypto.randomUUID(),
      daysOfWeek: [day],
      sortOrder: (template.sortOrder || 0) + dayIndex,
      createdAt: reused?.createdAt ?? now,
      updatedAt: now,
    };
  });
};
