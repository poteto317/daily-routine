import type { usePresetCreationState } from "./usePresetCreationState";
import type { usePresetEditState } from "./usePresetEditState";
import type { usePresetManagerActionHandlers } from "./usePresetManagerActionHandlers";
import type { usePresetManagerBaseState } from "./usePresetManagerBaseState";

type PresetManagerBaseState = ReturnType<typeof usePresetManagerBaseState>;
type PresetManagerCreationState = ReturnType<typeof usePresetCreationState>;
type PresetManagerEditState = ReturnType<typeof usePresetEditState>;
type PresetManagerActionHandlers = ReturnType<
  typeof usePresetManagerActionHandlers
>;

type CreatePresetManagerStateResultParams = {
  actionHandlers: PresetManagerActionHandlers;
  baseState: PresetManagerBaseState;
  creationState: PresetManagerCreationState;
  editState: PresetManagerEditState;
};

export const createPresetManagerStateResult = ({
  actionHandlers,
  baseState,
  creationState,
  editState,
}: CreatePresetManagerStateResultParams) => {
  return {
    presets: baseState.presets,
    selectedPresetId: baseState.selectedPresetId,
    selectedDays: baseState.selectedDays,
    setSelectedPresetId: baseState.setSelectedPresetId,
    handleDeletePreset: actionHandlers.handleDeletePreset,
    handleApplyPreset: actionHandlers.handleApplyPreset,
    toggleDaySelection: actionHandlers.toggleDaySelection,
    ...creationState,
    ...editState,
  };
};
