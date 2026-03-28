import { useState } from "react";
import { createPresetApplySelectionStateResult } from "./presetApplySelectionStateResult";

export const usePresetApplySelectionState = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());

  return createPresetApplySelectionStateResult({
    selectedPresetId,
    selectedDays,
    setSelectedPresetId,
    setSelectedDays,
  });
};
