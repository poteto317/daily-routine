import { useTestMatrixCollapseState } from "./useTestMatrixCollapseState";
import { useTestMatrixFilterState } from "./useTestMatrixFilterState";
import { useTestMatrixSelectionState } from "./useTestMatrixSelectionState";
import { createTestMatrixViewStateResult } from "./testMatrixViewStateResult";

export const useTestMatrixViewState = () => {
  const collapseState = useTestMatrixCollapseState();
  const filterState = useTestMatrixFilterState();
  const selectionState = useTestMatrixSelectionState();

  return createTestMatrixViewStateResult({
    collapseState,
    filterState,
    selectionState,
  });
};
