import type { usePresetCreationFormState } from "./usePresetCreationFormState";
import type { usePresetCreationSelectionState } from "./usePresetCreationSelectionState";

type PresetCreationFormState = ReturnType<typeof usePresetCreationFormState>;
type PresetCreationSelectionState = ReturnType<
  typeof usePresetCreationSelectionState
>;

type CreatePresetCreationStateResultParams = {
  formState: PresetCreationFormState;
  selectionState: PresetCreationSelectionState;
  handleCreatePreset: () => void;
  toggleRoutineSelection: (routineId: string) => void;
  toggleCreateFilterDay: (day: number) => void;
};

export const createPresetCreationStateResult = ({
  formState,
  selectionState,
  handleCreatePreset,
  toggleRoutineSelection,
  toggleCreateFilterDay,
}: CreatePresetCreationStateResultParams) => {
  return {
    isCreating: formState.isCreating,
    newPresetName: formState.newPresetName,
    newPresetDescription: formState.newPresetDescription,
    selectedRoutines: selectionState.selectedRoutines,
    createFilterDays: selectionState.createFilterDays,
    setIsCreating: formState.setIsCreating,
    setNewPresetName: formState.setNewPresetName,
    setNewPresetDescription: formState.setNewPresetDescription,
    handleCreatePreset,
    toggleRoutineSelection,
    toggleCreateFilterDay,
  };
};
