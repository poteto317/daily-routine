import { DETAILED_TEST_CASES } from "./detailedTestCases";
import type { DetailData, StoredDetailData } from "./matrixComputations";
import {
  migrateLegacyCategories,
  migrateLegacyDetailData,
} from "./testMatrixIdMigration";
import type { TestCategory } from "./types";

export const mergeStoredTestMatrixCategories = (
  initialCategories: TestCategory[],
  storedCategories: TestCategory[],
): TestCategory[] => {
  const migratedCategories = migrateLegacyCategories(storedCategories);

  return initialCategories.map((category) => {
    const savedCategory = migratedCategories.find(
      (item) => item.id === category.id,
    );
    if (!savedCategory) return category;

    return {
      ...category,
      items: category.items.map((item) => {
        const savedItem = savedCategory.items.find(
          (saved) => saved.id === item.id,
        );
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
