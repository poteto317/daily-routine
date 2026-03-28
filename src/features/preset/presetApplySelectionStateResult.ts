import type { Dispatch, SetStateAction } from "react";

type CreatePresetApplySelectionStateResultParams = {
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  setSelectedPresetId: Dispatch<SetStateAction<string | null>>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

export const createPresetApplySelectionStateResult = ({
  selectedPresetId,
  selectedDays,
  setSelectedPresetId,
  setSelectedDays,
}: CreatePresetApplySelectionStateResultParams) => {
  return {
    selectedPresetId,
    selectedDays,
    setSelectedPresetId,
    setSelectedDays,
  };
};
