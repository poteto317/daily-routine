import { useEffect } from "react";
import type { DetailData } from "./matrixComputations";
import {
  saveTestMatrixCategories,
  saveTestMatrixDetailData,
} from "./testMatrixLocalStorage";
import type { TestCategory } from "./types";

type UseTestMatrixPersistenceParams = {
  categories: TestCategory[];
  detailData: DetailData;
};

export const useTestMatrixPersistence = ({
  categories,
  detailData,
}: UseTestMatrixPersistenceParams) => {
  useEffect(() => {
    saveTestMatrixCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveTestMatrixDetailData(detailData);
  }, [detailData]);
};
