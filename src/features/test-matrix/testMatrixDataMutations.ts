import type { DetailData } from "./matrixComputations";
import { nextStatus } from "./statusHelpers";
import type { TestCategory, TestField } from "./types";

export const updateTestMatrixItemStatus = (
  categories: TestCategory[],
  categoryId: string,
  itemId: string,
  field: TestField,
): TestCategory[] => {
  return categories.map((category) =>
    category.id === categoryId
      ? {
          ...category,
          items: category.items.map((item) =>
            item.id === itemId
              ? { ...item, [field]: nextStatus(item[field]) }
              : item,
          ),
        }
      : category,
  );
};

export const updateTestMatrixItemNote = (
  categories: TestCategory[],
  categoryId: string,
  itemId: string,
  note: string,
): TestCategory[] => {
  return categories.map((category) =>
    category.id === categoryId
      ? {
          ...category,
          items: category.items.map((item) =>
            item.id === itemId ? { ...item, note } : item,
          ),
        }
      : category,
  );
};

export const updateDetailCaseStatus = (
  detailData: DetailData,
  selectedItemId: string | null,
  caseId: string,
  field: TestField,
): DetailData => {
  if (!selectedItemId) {
    return detailData;
  }

  const cases = detailData[selectedItemId] || [];
  return {
    ...detailData,
    [selectedItemId]: cases.map((testCase) =>
      testCase.id === caseId
        ? { ...testCase, [field]: nextStatus(testCase[field]) }
        : testCase,
    ),
  };
};

export const updateDetailCaseNote = (
  detailData: DetailData,
  selectedItemId: string | null,
  caseId: string,
  note: string,
): DetailData => {
  if (!selectedItemId) {
    return detailData;
  }

  const cases = detailData[selectedItemId] || [];
  return {
    ...detailData,
    [selectedItemId]: cases.map((testCase) =>
      testCase.id === caseId ? { ...testCase, note } : testCase,
    ),
  };
};
