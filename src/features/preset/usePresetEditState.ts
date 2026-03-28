import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import {
  createPresetCancelEditHandler,
  createPresetSaveEditHandler,
  createPresetStartEditHandler,
} from "./presetEditActions";
import { createPresetEditStateResult } from "./presetEditStateResult";
import { createPresetSelectionToggleHandler } from "./presetSelectionActions";
import { usePresetEditFieldsState } from "./usePresetEditFieldsState";
import { usePresetEditingTargetState } from "./usePresetEditingTargetState";

type UsePresetEditStateParams = {
  currentRoutines: Routine[];
  presets: RoutinePreset[];
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
  setSelectedPresetId: Dispatch<SetStateAction<string | null>>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

export const usePresetEditState = ({
  currentRoutines,
  presets,
  setPresets,
  setSelectedPresetId,
  setSelectedDays,
}: UsePresetEditStateParams) => {
  const targetState = usePresetEditingTargetState();
  const fieldsState = usePresetEditFieldsState();

  const handleStartEdit = createPresetStartEditHandler({
    presets,
    setEditingPresetId: targetState.setEditingPresetId,
    setEditPresetName: fieldsState.setEditPresetName,
    setEditPresetDescription: fieldsState.setEditPresetDescription,
    setEditSelectedRoutines: fieldsState.setEditSelectedRoutines,
    setSelectedPresetId,
    setSelectedDays,
  });
  const handleCancelEdit = createPresetCancelEditHandler({
    setEditingPresetId: targetState.setEditingPresetId,
    setEditPresetName: fieldsState.setEditPresetName,
    setEditPresetDescription: fieldsState.setEditPresetDescription,
    setEditSelectedRoutines: fieldsState.setEditSelectedRoutines,
  });
  const handleSaveEdit = createPresetSaveEditHandler({
    presets,
    editingPresetId: targetState.editingPresetId,
    editPresetName: fieldsState.editPresetName,
    editPresetDescription: fieldsState.editPresetDescription,
    editSelectedRoutines: fieldsState.editSelectedRoutines,
    currentRoutines,
    setPresets,
    setEditingPresetId: targetState.setEditingPresetId,
    setEditPresetName: fieldsState.setEditPresetName,
    setEditPresetDescription: fieldsState.setEditPresetDescription,
    setEditSelectedRoutines: fieldsState.setEditSelectedRoutines,
  });
  const toggleEditRoutineSelection = createPresetSelectionToggleHandler(
    fieldsState.editSelectedRoutines,
    fieldsState.setEditSelectedRoutines,
  );

  return createPresetEditStateResult({
    targetState,
    fieldsState,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    toggleEditRoutineSelection,
  });
};
