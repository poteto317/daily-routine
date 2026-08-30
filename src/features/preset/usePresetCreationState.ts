import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetCreateHandler } from "./presetCreateActions";
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
    sourceDay: selectionState.sourceDay,
    setPresets,
    setIsCreating: formState.setIsCreating,
    setNewPresetName: formState.setNewPresetName,
    setNewPresetDescription: formState.setNewPresetDescription,
    setSourceDay: selectionState.setSourceDay,
  });

  return {
    isCreating: formState.isCreating,
    newPresetName: formState.newPresetName,
    newPresetDescription: formState.newPresetDescription,
    sourceDay: selectionState.sourceDay,
    setIsCreating: formState.setIsCreating,
    setNewPresetName: formState.setNewPresetName,
    setNewPresetDescription: formState.setNewPresetDescription,
    setSourceDay: selectionState.setSourceDay,
    handleCreatePreset,
  };
};
