import { DETAILED_TEST_CASES } from "./detailedTestCases";
import { buildInitialData } from "./initialData";
import testMatrixTexts from "./locales/ja.json";
import type { DetailData, StoredDetailData } from "./matrixComputations";
import {
  mergeStoredDetailData,
  mergeStoredTestMatrixCategories,
} from "./testMatrixStoredDataMerge";
import type { TestCategory } from "./types";

export const getStoredTestMatrixCategories = (): TestCategory[] => {
  const initialCategories = buildInitialData();

  if (typeof window === "undefined") return initialCategories;

  const saved = localStorage.getItem(testMatrixTexts.page.storageKeys.matrix);
  if (!saved) return initialCategories;

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
  if (typeof window === "undefined") return {};

  const saved = localStorage.getItem(testMatrixTexts.page.storageKeys.detail);
  if (!saved) return { ...DETAILED_TEST_CASES };

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
  // 定義から補完できるscenario / expectedを除外して保存量を抑える。
  const toStore: StoredDetailData = Object.fromEntries(
    Object.entries(detailData).map(([key, cases]) => [
      key,
      cases.map(({ id, pc, sp, note }) => ({ id, pc, sp, note })),
    ]),
  );
  localStorage.setItem(
    testMatrixTexts.page.storageKeys.detail,
    JSON.stringify(toStore),
  );
};
