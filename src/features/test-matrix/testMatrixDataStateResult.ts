import type { Dispatch, SetStateAction } from "react";
import type { DetailData } from "./matrixComputations";
import type { TestCategory } from "./types";

type CategoriesState = [
  TestCategory[],
  Dispatch<SetStateAction<TestCategory[]>>,
];
type DetailDataState = [DetailData, Dispatch<SetStateAction<DetailData>>];
type TestMatrixActions = ReturnType<
  typeof import("./useTestMatrixDataActions").useTestMatrixDataActions
>;

type CreateTestMatrixDataStateResultArgs = {
  categoriesState: CategoriesState;
  detailDataState: DetailDataState;
  actions: TestMatrixActions;
};

export const createTestMatrixDataStateResult = ({
  categoriesState,
  detailDataState,
  actions,
}: CreateTestMatrixDataStateResultArgs) => ({
  categories: categoriesState[0],
  detailData: detailDataState[0],
  ...actions,
});
