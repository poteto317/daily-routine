import { useState } from "react";
import { createTestMatrixFilterStateResult } from "./testMatrixFilterStateResult";
import type { CheckStatus } from "./types";

export const useTestMatrixFilterState = () => {
  const [filterStatus, setFilterStatus] = useState<CheckStatus | "all">("all");

  return createTestMatrixFilterStateResult({
    filterStatus,
    setFilterStatus,
  });
};
