import type { RoutinePreset, RoutineTemplate } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";
import { buildRoutineIdentityKey } from "./presetRoutineIdentity";

const STORAGE_KEY = "routine-presets";

/**
 * title・startTimeが一致するテンプレートを排除し、最初に出現したものだけを残す。
 * 複数曜日ルーティンを選択して作成された過去のプリセットに含まれる重複
 * テンプレートを読み込み時に正規化するために使う。
 */
const dedupeRoutineTemplates = (
  templates: RoutineTemplate[] | undefined,
): RoutineTemplate[] => {
  // localStorage / 同期経由のデータは型検証されないため、配列でない場合に備える。
  if (!Array.isArray(templates)) return [];

  const seen = new Set<string>();
  const deduped: RoutineTemplate[] = [];

  for (const template of templates) {
    if (!template) continue;

    const key = buildRoutineIdentityKey(template.title, template.startTime);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(template);
  }

  return deduped;
};

export const getPresets = (): RoutinePreset[] => {
  const presets = getStorageItem<RoutinePreset[]>(STORAGE_KEY, []);
  if (!Array.isArray(presets)) return [];

  return presets
    .filter((preset): preset is RoutinePreset => Boolean(preset))
    .map((preset) => ({
      ...preset,
      routineTemplates: dedupeRoutineTemplates(preset.routineTemplates),
    }));
};

export const savePresets = (presets: RoutinePreset[]): void => {
  setStorageItem(STORAGE_KEY, presets);
};
