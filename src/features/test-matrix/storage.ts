import { DETAILED_TEST_CASES } from "./detailedTestCases";
import { buildInitialData } from "./initialData";
import type { DetailData, StoredDetailData } from "./matrixComputations";
import testMatrixTexts from "./locales/ja.json";
import type { TestCategory } from "./types";

// ---------------------------------------------------------------------------
// ID マイグレーション (broken version: 9d3a8a5 → 01d5254)
//
// 9d3a8a5 でセクション番号が繰り下がったため、以下のIDが変化した:
//   - todo-lists アイテム: 16-*      → todo-lists-*
//   - common-ui アイテム:  17-*      → 16-*
//   - pwa アイテム:        18-*      → 17-*
//   - lib アイテム:        19-*      → 18-*
// 01d5254 でロールバック済みだが、その間に保存されたデータを救済するために
// 旧 ID → 新 ID へのマッピングを読み込み時に適用する。
// ---------------------------------------------------------------------------

const LEGACY_CATEGORY_ITEM_ID_MAPS: Record<string, Record<string, string>> = {
  // todo-lists アイテムは 20 件（todo-lists-1 〜 todo-lists-20）
  "todo-lists": Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [`16-${i + 1}`, `todo-lists-${i + 1}`]),
  ),
  // common-ui アイテムは 11 件（16-1 〜 16-11）
  "common-ui": Object.fromEntries(
    Array.from({ length: 11 }, (_, i) => [`17-${i + 1}`, `16-${i + 1}`]),
  ),
  // pwa アイテムは 4 件（17-1 〜 17-4）
  pwa: Object.fromEntries(
    Array.from({ length: 4 }, (_, i) => [`18-${i + 1}`, `17-${i + 1}`]),
  ),
  // lib アイテムは 5 件（18-1 〜 18-5）
  lib: Object.fromEntries(
    Array.from({ length: 5 }, (_, i) => [`19-${i + 1}`, `18-${i + 1}`]),
  ),
};

// 詳細データ用フラットマップ（全カテゴリ分を結合）
const LEGACY_DETAIL_ITEM_ID_MAP: Record<string, string> = {
  ...LEGACY_CATEGORY_ITEM_ID_MAPS["common-ui"],
  ...LEGACY_CATEGORY_ITEM_ID_MAPS["pwa"],
  ...LEGACY_CATEGORY_ITEM_ID_MAPS["lib"],
  ...LEGACY_CATEGORY_ITEM_ID_MAPS["todo-lists"],
};

/**
 * 保存済みカテゴリデータの broken version アイテムIDを現在のIDへ変換する。
 * カテゴリ ID をコンテキストとして利用するため曖昧さなくマイグレーションできる。
 */
export const migrateLegacyCategories = (
  storedCategories: TestCategory[],
): TestCategory[] => {
  return storedCategories.map((category) => {
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
};

/**
 * 保存済み詳細データが broken version (9d3a8a5) のものか検出する。
 * common-ui が 17-5 以降（pre-PR の pwa は 17-1〜17-4 のみ）または
 * lib が 19-* で保存されていれば確実に broken version のデータ。
 */
export const hasBrokenVersionDetailData = (data: StoredDetailData): boolean => {
  return Object.keys(data).some((key) =>
    /^17-[5-9]$|^17-1[01]$|^19-\d+$/.test(key),
  );
};

/**
 * broken version のIDで保存された詳細データを現在のIDへ変換する。
 * アイテムIDキーとその配下のケースIDのプレフィックスを同時に変換する。
 *
 * 衝突回避: 旧ID（legacy）と現行IDが同一データ内に共存する場合は
 * 現行IDのデータを優先して保持する。
 * - Pass 1: legacy キーを新キーへ移行（低優先度）
 * - Pass 2: 現行キーで上書き（高優先度）
 */
export const migrateLegacyDetailData = (data: StoredDetailData): StoredDetailData => {
  if (!hasBrokenVersionDetailData(data)) return data;

  const result: StoredDetailData = {};

  // Pass 1: legacy ID を新 ID へマイグレーション（低優先度）
  for (const [key, cases] of Object.entries(data)) {
    const newKey = LEGACY_DETAIL_ITEM_ID_MAP[key];
    if (newKey !== undefined) {
      result[newKey] = cases.map((c) => ({
        ...c,
        // ケースID は "{itemId}-{caseNumber}" の形式なので、
        // itemId 部分のプレフィックスを新 ID に置き換える。
        // 例: "17-5-1" → suffix="1" → "16-5-1"
        id: c.id.startsWith(`${key}-`)
          ? `${newKey}-${c.id.slice(key.length + 1)}`
          : c.id,
      }));
    }
  }

  // Pass 2: 現行 ID のデータで上書き（高優先度）
  // 旧ID→新IDでマイグレーションした内容より現行フォーマットのデータを優先する。
  for (const [key, cases] of Object.entries(data)) {
    if (LEGACY_DETAIL_ITEM_ID_MAP[key] === undefined) {
      result[key] = cases;
    }
  }

  return result;
};

export const mergeStoredTestMatrixCategories = (
  initialCategories: TestCategory[],
  storedCategories: TestCategory[],
): TestCategory[] => {
  const migratedCategories = migrateLegacyCategories(storedCategories);
  return initialCategories.map((category) => {
    const savedCategory = migratedCategories.find((item) => item.id === category.id);
    if (!savedCategory) {
      return category;
    }

    return {
      ...category,
      items: category.items.map((item) => {
        const savedItem = savedCategory.items.find((saved) => saved.id === item.id);
        return savedItem ? { ...item, ...savedItem } : item;
      }),
    };
  });
};

export const mergeStoredDetailData = (
  storedDetailData: StoredDetailData,
): DetailData => {
  const migratedData = migrateLegacyDetailData(storedDetailData);
  const merged: DetailData = {};

  for (const [itemId, cases] of Object.entries(DETAILED_TEST_CASES)) {
    merged[itemId] = cases.map((testCase) => {
      const savedCase = migratedData[itemId]?.find(
        (saved) => saved.id === testCase.id,
      );

      return savedCase
        ? {
            ...testCase,
            pc: savedCase.pc,
            sp: savedCase.sp,
            note: savedCase.note,
          }
        : testCase;
    });
  }

  return merged;
};

export const getStoredTestMatrixCategories = (): TestCategory[] => {
  const initialCategories = buildInitialData();

  if (typeof window === "undefined") {
    return initialCategories;
  }

  const saved = localStorage.getItem(testMatrixTexts.page.storageKeys.matrix);
  if (!saved) {
    return initialCategories;
  }

  try {
    return mergeStoredTestMatrixCategories(
      initialCategories,
      JSON.parse(saved) as TestCategory[],
    );
  } catch {
    return initialCategories;
  }
};

export const getStoredTestMatrixDetailData = (): DetailData => {
  if (typeof window === "undefined") {
    return {};
  }

  const saved = localStorage.getItem(testMatrixTexts.page.storageKeys.detail);
  if (!saved) {
    return { ...DETAILED_TEST_CASES };
  }

  try {
    return mergeStoredDetailData(JSON.parse(saved) as StoredDetailData);
  } catch {
    return { ...DETAILED_TEST_CASES };
  }
};

export const saveTestMatrixCategories = (categories: TestCategory[]): void => {
  localStorage.setItem(
    testMatrixTexts.page.storageKeys.matrix,
    JSON.stringify(categories),
  );
};

export const saveTestMatrixDetailData = (detailData: DetailData): void => {
  localStorage.setItem(
    testMatrixTexts.page.storageKeys.detail,
    JSON.stringify(detailData),
  );
};
