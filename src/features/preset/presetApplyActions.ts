import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { applyPresetSelection } from "./presetApplyWorkflow";
import { PRESET_MANAGER_MESSAGES } from "./presetManagerPresentation";

type ApplyPresetHandlerArgs = {
  presets: RoutinePreset[];
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  onApplyPreset: (
    routines: Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[],
    targetDays: number[],
  ) => void;
  setSelectedPresetId: Dispatch<SetStateAction<string | null>>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

export const createPresetApplyHandler = ({
  presets,
  selectedPresetId,
  selectedDays,
  onApplyPreset,
  setSelectedPresetId,
  setSelectedDays,
}: ApplyPresetHandlerArgs) => {
  return () => {
    const result = applyPresetSelection({
      presets,
      selectedPresetId,
      selectedDays,
      onApplyPreset,
    });
    if (!result.applied) {
      if (result.failureReason === "invalid-selection") {
        window.alert(PRESET_MANAGER_MESSAGES.alertNoSelectionForApply);
      }
      if (result.failureReason === "empty-preset") {
        window.alert(PRESET_MANAGER_MESSAGES.alertEmptyPreset);
      }
      return;
    }

    window.alert(PRESET_MANAGER_MESSAGES.alertPresetApplied(result.presetName));
    setSelectedPresetId(null);
    setSelectedDays(new Set());
  };
};
