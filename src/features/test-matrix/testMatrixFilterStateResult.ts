import type { Dispatch, SetStateAction } from "react";
import type { CheckStatus } from "./types";

type TestMatrixFilterStateResultInput = {
  filterStatus: CheckStatus | "all";
  setFilterStatus: Dispatch<SetStateAction<CheckStatus | "all">>;
};

export const createTestMatrixFilterStateResult = ({
  filterStatus,
  setFilterStatus,
}: TestMatrixFilterStateResultInput) => ({
  filterStatus,
  setFilterStatus,
});
