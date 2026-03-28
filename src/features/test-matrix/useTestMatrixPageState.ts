import { createTestMatrixPageActions } from "./testMatrixPageActions";
import { createTestMatrixPageStateResult } from "./testMatrixPageStateResult";
import { useTestMatrixDataState } from "./useTestMatrixDataState";
import { useTestMatrixDerivedState } from "./useTestMatrixDerivedState";
import { useTestMatrixViewState } from "./useTestMatrixViewState";

type UseTestMatrixPageStateParams = {
  confirmReset?: (message: string) => boolean;
  resetConfirmMessage: string;
};

export const useTestMatrixPageState = ({
  confirmReset = (message) => confirm(message),
  resetConfirmMessage,
}: UseTestMatrixPageStateParams) => {
  const viewState = useTestMatrixViewState();
  const dataState = useTestMatrixDataState({
    confirmReset,
    resetConfirmMessage,
    selectedItemId: viewState.selectedItemId,
  });

  const derivedState = useTestMatrixDerivedState({
    categories: dataState.categories,
    detailData: dataState.detailData,
    selectedItemId: viewState.selectedItemId,
  });
  const pageActions = createTestMatrixPageActions({
    categories: dataState.categories,
    handleCollapseAllBase: viewState.handleCollapseAll,
  });

  return createTestMatrixPageStateResult({
    categories: dataState.categories,
    collapseAll: viewState.collapseAll,
    collapsedIds: viewState.collapsedIds,
    detailData: dataState.detailData,
    filterStatus: viewState.filterStatus,
    overviewStats: derivedState.overviewStats,
    selectedItem: derivedState.selectedItem,
    selectedItemId: viewState.selectedItemId,
    setFilterStatus: viewState.setFilterStatus,
    setSelectedItemId: viewState.setSelectedItemId,
    toggleStatus: dataState.toggleStatus,
    updateNote: dataState.updateNote,
    toggleDetailStatus: dataState.toggleDetailStatus,
    updateDetailNote: dataState.updateDetailNote,
    toggleCollapse: viewState.toggleCollapse,
    handleCollapseAll: pageActions.handleCollapseAll,
    resetAll: dataState.resetAll,
  });
};
