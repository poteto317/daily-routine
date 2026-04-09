import { type Routine } from "@/types/routine";
import { usePresetCreationState } from "./usePresetCreationState";
import { usePresetEditState } from "./usePresetEditState";
import { usePresetManagerActionHandlers } from "./usePresetManagerActionHandlers";
import { usePresetManagerBaseState } from "./usePresetManagerBaseState";
import { createPresetManagerStateResult } from "./presetManagerStateResult";

interface UsePresetManagerStateParams {
  currentRoutines: Routine[];
  onApplyPreset: (
    routines: Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[],
    targetDays: number[],
  ) => void;
}

export const usePresetManagerState = ({
  currentRoutines,
  onApplyPreset,
}: UsePresetManagerStateParams) => {
  const baseState = usePresetManagerBaseState();
  const creationState = usePresetCreationState({
    currentRoutines,
    setPresets: baseState.setPresets,
  });
  const editState = usePresetEditState({
    currentRoutines,
    presets: baseState.presets,
    setPresets: baseState.setPresets,
    setSelectedPresetId: baseState.setSelectedPresetId,
    setSelectedDays: baseState.setSelectedDays,
  });
  const actionHandlers = usePresetManagerActionHandlers({
    presets: baseState.presets,
    selectedPresetId: baseState.selectedPresetId,
    selectedDays: baseState.selectedDays,
    onApplyPreset,
    setPresets: baseState.setPresets,
    setSelectedPresetId: baseState.setSelectedPresetId,
    setSelectedDays: baseState.setSelectedDays,
  });

  return createPresetManagerStateResult({
    actionHandlers,
    baseState,
    creationState,
    editState,
  });
};
