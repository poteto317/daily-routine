type TestMatrixCollapseState = ReturnType<
  typeof import("./useTestMatrixCollapseState").useTestMatrixCollapseState
>;
type TestMatrixFilterState = ReturnType<
  typeof import("./useTestMatrixFilterState").useTestMatrixFilterState
>;
type TestMatrixSelectionState = ReturnType<
  typeof import("./useTestMatrixSelectionState").useTestMatrixSelectionState
>;

type CreateTestMatrixViewStateResultArgs = {
  collapseState: TestMatrixCollapseState;
  filterState: TestMatrixFilterState;
  selectionState: TestMatrixSelectionState;
};

export const createTestMatrixViewStateResult = ({
  collapseState,
  filterState,
  selectionState,
}: CreateTestMatrixViewStateResultArgs) => ({
  ...collapseState,
  ...filterState,
  ...selectionState,
});
