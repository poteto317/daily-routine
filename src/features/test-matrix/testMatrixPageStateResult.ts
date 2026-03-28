import type { DetailData, MatrixOverviewStats } from "./matrixComputations";
import type { CheckStatus, TestCategory, TestItem } from "./types";

type TestMatrixPageStateResultArgs = {
  categories: TestCategory[];
  collapseAll: boolean;
  collapsedIds: Set<string>;
  detailData: DetailData;
  filterStatus: CheckStatus | "all";
  handleCollapseAll: () => void;
  overviewStats: MatrixOverviewStats;
  resetAll: () => boolean;
  selectedItem: TestItem | null;
  selectedItemId: string | null;
  setFilterStatus: (value: CheckStatus | "all") => void;
  setSelectedItemId: (value: string | null) => void;
  toggleCollapse: (categoryId: string) => void;
  toggleDetailStatus: (caseId: string, field: "pc" | "sp") => void;
  toggleStatus: (
    categoryId: string,
    itemId: string,
    field: "pc" | "sp",
  ) => void;
  updateDetailNote: (caseId: string, note: string) => void;
  updateNote: (categoryId: string, itemId: string, note: string) => void;
};

export const createTestMatrixPageStateResult = ({
  categories,
  collapseAll,
  collapsedIds,
  detailData,
  filterStatus,
  handleCollapseAll,
  overviewStats,
  resetAll,
  selectedItem,
  selectedItemId,
  setFilterStatus,
  setSelectedItemId,
  toggleCollapse,
  toggleDetailStatus,
  toggleStatus,
  updateDetailNote,
  updateNote,
}: TestMatrixPageStateResultArgs) => {
  return {
    categories,
    collapseAll,
    collapsedIds,
    detailData,
    filterStatus,
    overviewStats,
    selectedItem,
    selectedItemId,
    setFilterStatus,
    setSelectedItemId,
    toggleStatus,
    updateNote,
    toggleDetailStatus,
    updateDetailNote,
    toggleCollapse,
    handleCollapseAll,
    resetAll,
  };
};
