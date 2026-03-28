import type { TestCategory } from "./types";

type CreateTestMatrixPageActionsArgs = {
  categories: TestCategory[];
  handleCollapseAllBase: (categories: TestCategory[]) => void;
};

export const createTestMatrixPageActions = ({
  categories,
  handleCollapseAllBase,
}: CreateTestMatrixPageActionsArgs) => {
  return {
    handleCollapseAll: () => handleCollapseAllBase(categories),
  };
};
