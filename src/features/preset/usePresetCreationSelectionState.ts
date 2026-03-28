import { useState } from "react";
import { createPresetCreationSelectionStateResult } from "./presetCreationSelectionStateResult";

export const usePresetCreationSelectionState = () => {
  const [selectedRoutines, setSelectedRoutines] = useState<Set<string>>(
    new Set(),
  );
  const [createFilterDays, setCreateFilterDays] = useState<Set<number>>(
    new Set(),
  );

  return createPresetCreationSelectionStateResult({
    createFilterDays,
    selectedRoutines,
    setCreateFilterDays,
    setSelectedRoutines,
  });
};
