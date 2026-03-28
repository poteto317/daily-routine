import type { Dispatch, SetStateAction } from "react";
import { createPresetDaySelectionToggleHandler } from "./presetSelectionActions";

type UsePresetDaySelectionActionParams = {
  selectedDays: Set<number>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

export const usePresetDaySelectionAction = ({
  selectedDays,
  setSelectedDays,
}: UsePresetDaySelectionActionParams) => {
  const toggleDaySelection = createPresetDaySelectionToggleHandler(
    selectedDays,
    setSelectedDays,
  );

  return {
    toggleDaySelection,
  };
};
