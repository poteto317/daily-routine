import { calculateOverviewStats } from "./matrixComputations";
import { findSelectedTestMatrixItem } from "./testMatrixDerivedSelectors";
import { createTestMatrixDerivedStateResult } from "./testMatrixDerivedStateResult";
import type { DetailData } from "./matrixComputations";
import type { TestCategory } from "./types";

type UseTestMatrixDerivedStateParams = {
  categories: TestCategory[];
  detailData: DetailData;
  selectedItemId: string | null;
};

export const useTestMatrixDerivedState = ({
  categories,
  detailData,
  selectedItemId,
}: UseTestMatrixDerivedStateParams) => {
  const selectedItem = findSelectedTestMatrixItem(categories, selectedItemId);
  const overviewStats = calculateOverviewStats(categories, detailData);

  return createTestMatrixDerivedStateResult({
    selectedItem,
    overviewStats,
  });
};
