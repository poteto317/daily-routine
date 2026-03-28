import type { TestCategory, TestItem } from "./types";

export const findSelectedTestMatrixItem = (
  categories: TestCategory[],
  selectedItemId: string | null,
): TestItem | null => {
  return selectedItemId
    ? categories
        .flatMap((category) => category.items)
        .find((item) => item.id === selectedItemId) || null
    : null;
};
