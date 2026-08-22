import { useState } from "react";
import type { DetailData } from "./matrixComputations";
import {
  getStoredTestMatrixCategories,
  getStoredTestMatrixDetailData,
} from "./testMatrixLocalStorage";
import type { TestCategory } from "./types";
import { createTestMatrixDataStateResult } from "./testMatrixDataStateResult";
import { useTestMatrixDataActions } from "./useTestMatrixDataActions";
import { useTestMatrixPersistence } from "./useTestMatrixPersistence";

type UseTestMatrixDataStateParams = {
  confirmReset?: (message: string) => boolean;
  resetConfirmMessage: string;
  selectedItemId: string | null;
};

export const useTestMatrixDataState = ({
  confirmReset = (message) => confirm(message),
  resetConfirmMessage,
  selectedItemId,
}: UseTestMatrixDataStateParams) => {
  const categoriesState = useState<TestCategory[]>(() =>
    getStoredTestMatrixCategories(),
  );
  const detailDataState = useState<DetailData>(() =>
    getStoredTestMatrixDetailData(),
  );
  const [categories, setCategories] = categoriesState;
  const [detailData, setDetailData] = detailDataState;
  useTestMatrixPersistence({ categories, detailData });

  const actions = useTestMatrixDataActions({
    confirmReset,
    resetConfirmMessage,
    selectedItemId,
    setCategories,
    setDetailData,
  });

  return createTestMatrixDataStateResult({
    categoriesState,
    detailDataState,
    actions,
  });
};
