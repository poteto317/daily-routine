import { DETAILED_TEST_CASES } from "./detailedTestCases";
import { buildInitialData } from "./initialData";
import type { DetailData } from "./matrixComputations";
import type { TestCategory } from "./types";

export const createResetTestMatrixState = (): {
  categories: TestCategory[];
  detailData: DetailData;
} => {
  return {
    categories: buildInitialData(),
    detailData: { ...DETAILED_TEST_CASES },
  };
};
