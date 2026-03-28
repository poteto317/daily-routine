import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetCreateHandler } from "./presetCreateActions";
import {
  createPresetFilterDayToggleHandler,
  createPresetSelectionToggleHandler,
} from "./presetSelectionActions";
import { createPresetCreationStateResult } from "./presetCreationStateResult";
import { usePresetCreationFormState } from "./usePresetCreationFormState";
import { usePresetCreationSelectionState } from "./usePresetCreationSelectionState";

type UsePresetCreationStateParams = {
  currentRoutines: Routine[];
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
};

export const usePresetCreationState = ({
  currentRoutines,
  setPresets,
}: UsePresetCreationStateParams) => {
  const formState = usePresetCreationFormState();
  const selectionState = usePresetCreationSelectionState();

  const handleCreatePreset = createPresetCreateHandler({
    currentRoutines,
    newPresetName: formState.newPresetName,
    newPresetDescription: formState.newPresetDescription,
    selectedRoutines: selectionState.selectedRoutines,
    setPresets,
    setIsCreating: formState.setIsCreating,
    setNewPresetName: formState.setNewPresetName,
    setNewPresetDescription: formState.setNewPresetDescription,
    setSelectedRoutines: selectionState.setSelectedRoutines,
    setCreateFilterDays: selectionState.setCreateFilterDays,
  });
  const toggleRoutineSelection = createPresetSelectionToggleHandler(
    selectionState.selectedRoutines,
    selectionState.setSelectedRoutines,
  );
  const toggleCreateFilterDay = createPresetFilterDayToggleHandler({
    currentRoutines,
    createFilterDays: selectionState.createFilterDays,
    selectedRoutines: selectionState.selectedRoutines,
    setCreateFilterDays: selectionState.setCreateFilterDays,
    setSelectedRoutines: selectionState.setSelectedRoutines,
  });

  return createPresetCreationStateResult({
    formState,
    selectionState,
    handleCreatePreset,
    toggleRoutineSelection,
    toggleCreateFilterDay,
  });
};
