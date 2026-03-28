import { useCallback, useState } from "react";
import { createTestMatrixCollapseStateResult } from "./testMatrixCollapseStateResult";
import {
  createCollapseAllState,
  toggleCollapsedCategoryId,
} from "./testMatrixViewActions";
import type { TestCategory } from "./types";

export const useTestMatrixCollapseState = () => {
  const [collapseAll, setCollapseAll] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = useCallback((catId: string) => {
    setCollapsedIds((prev) => toggleCollapsedCategoryId(prev, catId));
  }, []);

  const handleCollapseAll = useCallback(
    (categories: TestCategory[]) => {
      const nextState = createCollapseAllState(collapseAll, categories);
      setCollapsedIds(nextState.collapsedIds);
      setCollapseAll(nextState.collapseAll);
    },
    [collapseAll],
  );

  return createTestMatrixCollapseStateResult({
    collapseAll,
    collapsedIds,
    handleCollapseAll,
    toggleCollapse,
  });
};
