import type { Dispatch, SetStateAction } from "react";

type CreatePresetCreationSelectionStateResultParams = {
  createFilterDays: Set<number>;
  selectedRoutines: Set<string>;
  setCreateFilterDays: Dispatch<SetStateAction<Set<number>>>;
  setSelectedRoutines: Dispatch<SetStateAction<Set<string>>>;
};

export const createPresetCreationSelectionStateResult = ({
  createFilterDays,
  selectedRoutines,
  setCreateFilterDays,
  setSelectedRoutines,
}: CreatePresetCreationSelectionStateResultParams) => {
  return {
    createFilterDays,
    selectedRoutines,
    setCreateFilterDays,
    setSelectedRoutines,
  };
};
