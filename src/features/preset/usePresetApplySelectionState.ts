import { useState } from "react";

export const usePresetApplySelectionState = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());

  return {
    selectedPresetId,
    selectedDays,
    setSelectedPresetId,
    setSelectedDays,
  };
};
