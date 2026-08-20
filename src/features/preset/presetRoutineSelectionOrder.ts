import type { Routine } from "@/types/routine";
import {
  groupRoutinesForSelection,
  type RoutineSelectionGroup,
} from "./presetRoutineGrouping";

/**
 * 並べ替えに使う開始時刻。
 *
 * インポートは配列かどうかしか検証しておらず（transferPayloadRestore の
 * arrayField）、startTime を持たない記録が保存されうる。そのまま
 * localeCompare を呼ぶと例外になり、選択リストごと画面が壊れる。
 *
 * 空文字にそろえると、時刻の無い記録は先頭に並ぶ。消えるより目に付く方が
 * 直すきっかけになるため、後ろではなく前に出す。
 */
const toSortableStartTime = (group: RoutineSelectionGroup): string =>
  group.routine.startTime ?? "";

/**
 * ルーティン選択グループを開始時刻の昇順に並べ替える。
 *
 * startTime は常に HH:mm のゼロ埋め文字列のため、文字列比較がそのまま
 * 時刻の昇順になる。ホーム画面の並び順（routineDisplayActions）と同じ方式。
 *
 * グルーピングは選択リスト全体の前処理、並べ替えは画面ごとの表示都合という
 * 別の関心事のため、ファイルを分けている。
 */
export const sortRoutineSelectionGroupsByStartTime = (
  groups: RoutineSelectionGroup[],
): RoutineSelectionGroup[] => {
  return [...groups].sort((left, right) =>
    toSortableStartTime(left).localeCompare(toSortableStartTime(right)),
  );
};

/**
 * 編集画面に出す選択グループを作る。
 *
 * 「曜日違いをまとめてから時刻順に並べる」という表示ポリシーをここに置く。
 * 画面側に書くと、レイアウトを直すときと並び順を変えるときの両方で
 * 同じファイルを触ることになる。
 */
export const toTimeOrderedSelectionGroups = (
  routines: Routine[],
): RoutineSelectionGroup[] =>
  sortRoutineSelectionGroupsByStartTime(groupRoutinesForSelection(routines));
