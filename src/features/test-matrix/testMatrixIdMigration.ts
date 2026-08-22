import type { StoredDetailData } from "./matrixComputations";
import type { TestCategory } from "./types";

// 9d3a8a5 で一時的に変更され、01d5254 で戻されたIDを現行IDへ救済する。
const LEGACY_CATEGORY_ITEM_ID_MAPS: Record<string, Record<string, string>> = {
  "todo-lists": Object.fromEntries(
    Array.from({ length: 20 }, (_, index) => [
      `16-${index + 1}`,
      `todo-lists-${index + 1}`,
    ]),
  ),
  "common-ui": Object.fromEntries(
    Array.from({ length: 11 }, (_, index) => [
      `17-${index + 1}`,
      `16-${index + 1}`,
    ]),
  ),
  pwa: Object.fromEntries(
    Array.from({ length: 4 }, (_, index) => [
      `18-${index + 1}`,
      `17-${index + 1}`,
    ]),
  ),
  lib: Object.fromEntries(
    Array.from({ length: 5 }, (_, index) => [
      `19-${index + 1}`,
      `18-${index + 1}`,
    ]),
  ),
};

// 詳細データにはカテゴリ情報がない。現行common-uiと衝突しない
// todo-listsの16-12〜16-20だけをフラットマップへ追加する。
const LEGACY_DETAIL_ITEM_ID_MAP: Record<string, string> = {
  ...LEGACY_CATEGORY_ITEM_ID_MAPS["common-ui"],
  ...LEGACY_CATEGORY_ITEM_ID_MAPS.pwa,
  ...LEGACY_CATEGORY_ITEM_ID_MAPS.lib,
  ...Object.fromEntries(
    Array.from({ length: 9 }, (_, index) => [
      `16-${index + 12}`,
      `todo-lists-${index + 12}`,
    ]),
  ),
};

export const migrateLegacyCategories = (
  storedCategories: TestCategory[],
): TestCategory[] =>
  storedCategories.map((category) => {
    const itemIdMap = LEGACY_CATEGORY_ITEM_ID_MAPS[category.id];
    if (!itemIdMap) return category;

    const hasLegacyIds = category.items.some((item) => item.id in itemIdMap);
    if (!hasLegacyIds) return category;

    return {
      ...category,
      items: category.items.map((item) => ({
        ...item,
        id: itemIdMap[item.id] ?? item.id,
      })),
    };
  });

/**
 * broken versionを一意に識別できる詳細キーがあるかを返す。
 * common-uiの17-5〜17-11、libの19-1〜19-5、
 * todo-listsの16-12〜16-20が検出マーカーになる。
 */
export const hasBrokenVersionDetailData = (data: StoredDetailData): boolean =>
  Object.keys(data).some((key) =>
    /^(?:16-(?:1[2-9]|20)|17-[5-9]|17-1[01]|19-[1-5])$/.test(key),
  );

/**
 * broken versionのアイテムIDとケースIDプレフィックスを現行IDへ変換する。
 * 旧IDと現行IDが共存する場合は現行ID側を優先する。
 */
export const migrateLegacyDetailData = (
  data: StoredDetailData,
): StoredDetailData => {
  if (!hasBrokenVersionDetailData(data)) return data;

  const keys = Object.keys(data);
  const hasCommonUiBroken = keys.some((key) =>
    /^17-(?:[5-9]|1[01])$/.test(key),
  );
  const hasLibMarker18_5 = keys.includes("18-5");
  const result: StoredDetailData = {};
  const migratedSourceKeys = new Set<string>();

  // Pass 1: legacy IDを新IDへ移行する（低優先度）。
  for (const [key, cases] of Object.entries(data)) {
    const newKey = LEGACY_DETAIL_ITEM_ID_MAP[key];
    if (newKey === undefined) continue;

    // 17-1〜17-4は現行pwaとも重複するため、17-5以降がある場合だけ移行する。
    if (/^17-\d+$/.test(key) && !hasCommonUiBroken) continue;
    // 18-5があれば18-*は現行libなので、broken versionのpwaとして扱わない。
    if (/^18-\d+$/.test(key) && hasLibMarker18_5) continue;

    result[newKey] = cases.map((testCase) => ({
      ...testCase,
      id: testCase.id.startsWith(`${key}-`)
        ? `${newKey}-${testCase.id.slice(key.length + 1)}`
        : testCase.id,
    }));
    migratedSourceKeys.add(key);
  }

  // Pass 2: 未移行キー（現行データを含む）で上書きする（高優先度）。
  for (const [key, cases] of Object.entries(data)) {
    if (!migratedSourceKeys.has(key)) {
      result[key] = cases;
    }
  }

  return result;
};
