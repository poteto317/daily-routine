import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { DetailData } from "./matrixComputations";
import { createTestMatrixDataActionsResult } from "./testMatrixDataActionsResult";
import {
  updateDetailCaseNote,
  updateDetailCaseStatus,
  updateTestMatrixItemNote,
  updateTestMatrixItemStatus,
} from "./testMatrixDataMutations";
import { createResetTestMatrixState } from "./testMatrixResetState";
import type { TestCategory } from "./types";

type UseTestMatrixDataActionsParams = {
  confirmReset: (message: string) => boolean;
  resetConfirmMessage: string;
  selectedItemId: string | null;
  setCategories: Dispatch<SetStateAction<TestCategory[]>>;
  setDetailData: Dispatch<SetStateAction<DetailData>>;
};

export const useTestMatrixDataActions = ({
  confirmReset,
  resetConfirmMessage,
  selectedItemId,
  setCategories,
  setDetailData,
}: UseTestMatrixDataActionsParams) => {
  const toggleStatus = useCallback(
    (catId: string, itemId: string, field: "pc" | "sp") => {
      setCategories((prev) =>
        updateTestMatrixItemStatus(prev, catId, itemId, field),
      );
    },
    [setCategories],
  );

  const updateNote = useCallback(
    (catId: string, itemId: string, note: string) => {
      setCategories((prev) =>
        updateTestMatrixItemNote(prev, catId, itemId, note),
      );
    },
    [setCategories],
  );

  const toggleDetailStatus = useCallback(
    (caseId: string, field: "pc" | "sp") => {
      setDetailData((prev) =>
        updateDetailCaseStatus(prev, selectedItemId, caseId, field),
      );
    },
    [selectedItemId, setDetailData],
  );

  const updateDetailNote = useCallback(
    (caseId: string, note: string) => {
      setDetailData((prev) =>
        updateDetailCaseNote(prev, selectedItemId, caseId, note),
      );
    },
    [selectedItemId, setDetailData],
  );

  const resetAll = useCallback(() => {
    if (!confirmReset(resetConfirmMessage)) {
      return false;
    }

    const nextState = createResetTestMatrixState();
    setCategories(nextState.categories);
    setDetailData(nextState.detailData);
    return true;
  }, [confirmReset, resetConfirmMessage, setCategories, setDetailData]);

  return createTestMatrixDataActionsResult({
    resetAll,
    toggleDetailStatus,
    toggleStatus,
    updateDetailNote,
    updateNote,
  });
};
