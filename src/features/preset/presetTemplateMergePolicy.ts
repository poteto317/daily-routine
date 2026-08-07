import type { Routine, RoutinePreset, RoutineTemplate } from "@/types/routine";
import { findOrphanedRoutineTemplates } from "./presetEditSelectionResolver";
import { buildRoutineIdentityKey } from "./presetRoutineIdentity";
import { buildRoutineTemplatesFromRoutines } from "./presetTemplateConverter";

type ResolveUpdatedRoutineTemplatesParams = {
  preset: RoutinePreset;
  routinesToSave: Routine[];
  currentRoutines: Routine[];
};

const templateKey = (template: RoutineTemplate): string =>
  buildRoutineIdentityKey(template.title, template.startTime);

/**
 * 編集保存時に、最終的にプリセットへ保持するテンプレート集合を決定する。
 *
 * - プリセットの並び順は維持する（一覧表示順・適用時のsortOrderに反映されるため）。
 * - 元のルーティンが削除済みのテンプレートは編集画面の選択リストに表示できないため、
 *   選択操作の対象外として元の位置のまま保持する。
 * - 選択から外れたテンプレートは取り除き、新たに選択されたものは末尾に追加する。
 * - 結果が空になる場合は既存のテンプレートを維持する。
 */
export const resolveUpdatedRoutineTemplates = ({
  preset,
  routinesToSave,
  currentRoutines,
}: ResolveUpdatedRoutineTemplatesParams): RoutineTemplate[] => {
  const selectedTemplates = buildRoutineTemplatesFromRoutines(routinesToSave);
  const selectedByKey = new Map(
    selectedTemplates.map((template) => [templateKey(template), template]),
  );
  const orphanedKeys = new Set(
    findOrphanedRoutineTemplates(preset.routineTemplates, currentRoutines).map(
      templateKey,
    ),
  );

  const ordered: RoutineTemplate[] = [];
  const usedKeys = new Set<string>();

  // 既存の並び順を維持したまま、削除済み分と選択されたままの分を拾う
  for (const template of preset.routineTemplates) {
    const key = templateKey(template);
    if (usedKeys.has(key)) continue;

    if (orphanedKeys.has(key)) {
      ordered.push(template);
      usedKeys.add(key);
      continue;
    }

    const selected = selectedByKey.get(key);
    if (selected) {
      ordered.push(selected);
      usedKeys.add(key);
    }
  }

  // 新たに選択されたテンプレートを末尾に追加する
  for (const template of selectedTemplates) {
    const key = templateKey(template);
    if (usedKeys.has(key)) continue;
    ordered.push(template);
    usedKeys.add(key);
  }

  return ordered.length > 0 ? ordered : preset.routineTemplates;
};
