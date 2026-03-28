type SelectedItem = ReturnType<
  typeof import("./testMatrixDerivedSelectors").findSelectedTestMatrixItem
>;
type OverviewStats = ReturnType<
  typeof import("./matrixComputations").calculateOverviewStats
>;

type CreateTestMatrixDerivedStateResultArgs = {
  selectedItem: SelectedItem;
  overviewStats: OverviewStats;
};

export const createTestMatrixDerivedStateResult = ({
  selectedItem,
  overviewStats,
}: CreateTestMatrixDerivedStateResultArgs) => ({
  overviewStats,
  selectedItem,
});
