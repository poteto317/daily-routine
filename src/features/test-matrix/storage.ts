import { DETAILED_TEST_CASES } from "./detailedTestCases";
import { buildInitialData } from "./initialData";
import type { DetailData } from "./matrixComputations";
import testMatrixTexts from "./locales/ja.json";
import type { TestCategory } from "./types";

export const mergeStoredTestMatrixCategories = (
  initialCategories: TestCategory[],
  storedCategories: TestCategory[],
): TestCategory[] => {
  return initialCategories.map((category) => {
    const savedCategory = storedCategories.find((item) => item.id === category.id);
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
  storedDetailData: DetailData,
): DetailData => {
  const merged: DetailData = {};

  for (const [itemId, cases] of Object.entries(DETAILED_TEST_CASES)) {
    merged[itemId] = cases.map((testCase) => {
      const savedCase = storedDetailData[itemId]?.find(
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
    return mergeStoredDetailData(JSON.parse(saved) as DetailData);
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
