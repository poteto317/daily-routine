import { useState } from "react";
import { createTestMatrixSelectionStateResult } from "./testMatrixSelectionStateResult";

export const useTestMatrixSelectionState = () => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  return createTestMatrixSelectionStateResult({
    selectedItemId,
    setSelectedItemId,
  });
};
