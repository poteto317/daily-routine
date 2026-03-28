import type { TestCategory } from "./types";

export const toggleCollapsedCategoryId = (
  collapsedIds: Set<string>,
  categoryId: string,
): Set<string> => {
  const next = new Set(collapsedIds);
  if (next.has(categoryId)) {
    next.delete(categoryId);
  } else {
    next.add(categoryId);
  }
  return next;
};

export const createCollapseAllState = (
  collapseAll: boolean,
  categories: TestCategory[],
): { collapseAll: boolean; collapsedIds: Set<string> } => {
  return {
    collapseAll: !collapseAll,
    collapsedIds: collapseAll
      ? new Set()
      : new Set(categories.map((category) => category.id)),
  };
};
