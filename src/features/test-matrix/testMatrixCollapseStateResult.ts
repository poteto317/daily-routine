import type { TestCategory } from "./types";

type TestMatrixCollapseStateResultInput = {
  collapseAll: boolean;
  collapsedIds: Set<string>;
  handleCollapseAll: (categories: TestCategory[]) => void;
  toggleCollapse: (catId: string) => void;
};

export const createTestMatrixCollapseStateResult = ({
  collapseAll,
  collapsedIds,
  handleCollapseAll,
  toggleCollapse,
}: TestMatrixCollapseStateResultInput) => ({
  collapseAll,
  collapsedIds,
  handleCollapseAll,
  toggleCollapse,
});
