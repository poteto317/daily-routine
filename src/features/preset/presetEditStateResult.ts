import type { usePresetEditFieldsState } from "./usePresetEditFieldsState";
import type { usePresetEditingTargetState } from "./usePresetEditingTargetState";

type PresetEditingTargetState = ReturnType<typeof usePresetEditingTargetState>;
type PresetEditFieldsState = ReturnType<typeof usePresetEditFieldsState>;

type CreatePresetEditStateResultParams = {
  targetState: PresetEditingTargetState;
  fieldsState: PresetEditFieldsState;
  handleStartEdit: (presetId: string) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => void;
  toggleEditRoutineSelection: (routineId: string) => void;
};

export const createPresetEditStateResult = ({
  targetState,
  fieldsState,
  handleStartEdit,
  handleCancelEdit,
  handleSaveEdit,
  toggleEditRoutineSelection,
}: CreatePresetEditStateResultParams) => {
  return {
    editingPresetId: targetState.editingPresetId,
    editPresetName: fieldsState.editPresetName,
    editPresetDescription: fieldsState.editPresetDescription,
    editSelectedRoutines: fieldsState.editSelectedRoutines,
    setEditPresetName: fieldsState.setEditPresetName,
    setEditPresetDescription: fieldsState.setEditPresetDescription,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    toggleEditRoutineSelection,
  };
};
