import type { Routine, RoutineTemplate } from "@/types/routine";
import { buildRoutineIdentityKey } from "./presetRoutineIdentity";
import { groupRoutinesForSelection } from "./presetRoutineGrouping";

/**
 * プリセットのテンプレートに対応する現在のルーティンを探し、
 * 編集画面で選択済みにすべき代表ルーティンのidを返す。
 *
 * 選択UIはtitle+startTimeで統合されたグループ単位で動作するため、
 * ここでもグループの代表idを選択対象とする。
 */
export const resolveEditSelectedRoutineIds = (
  routineTemplates: RoutineTemplate[],
  currentRoutines: Routine[],
): Set<string> => {
  const representativeIdByKey = new Map(
    groupRoutinesForSelection(currentRoutines).map((group) => [
      group.key,
      group.routine.id,
    ]),
  );

  const selected = new Set<string>();

  for (const template of routineTemplates) {
    const key = buildRoutineIdentityKey(template.title, template.startTime);
    const representativeId = representativeIdByKey.get(key);
    if (representativeId) selected.add(representativeId);
  }

  return selected;
};

/**
 * 現在のルーティンに対応が存在しないテンプレート（元のルーティンが削除済み）を返す。
 * 編集画面の選択リストには表示できないため、保存時に失われないよう保持する用途で使う。
 */
export const findOrphanedRoutineTemplates = (
  routineTemplates: RoutineTemplate[],
  currentRoutines: Routine[],
): RoutineTemplate[] => {
  const existingKeys = new Set(
    groupRoutinesForSelection(currentRoutines).map((group) => group.key),
  );

  return routineTemplates.filter(
    (template) =>
      !existingKeys.has(
        buildRoutineIdentityKey(template.title, template.startTime),
      ),
  );
};
