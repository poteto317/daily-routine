import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import {
  createPresetCancelEditHandler,
  createPresetSaveEditHandler,
  createPresetStartEditHandler,
} from "./presetEditActions";
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
    setEditingPresetUpdatedAt: targetState.setEditingPresetUpdatedAt,
    setEditPresetName: fieldsState.setEditPresetName,
    setEditPresetDescription: fieldsState.setEditPresetDescription,
    setEditSourceDay: fieldsState.setEditSourceDay,
    setSelectedPresetId,
    setSelectedDays,
  });
  const handleCancelEdit = createPresetCancelEditHandler({
    setEditingPresetId: targetState.setEditingPresetId,
    setEditingPresetUpdatedAt: targetState.setEditingPresetUpdatedAt,
    setEditPresetName: fieldsState.setEditPresetName,
    setEditPresetDescription: fieldsState.setEditPresetDescription,
    setEditSourceDay: fieldsState.setEditSourceDay,
  });
  const handleSaveEdit = createPresetSaveEditHandler({
    presets,
    editingPresetId: targetState.editingPresetId,
    editingPresetUpdatedAt: targetState.editingPresetUpdatedAt,
    editPresetName: fieldsState.editPresetName,
    editPresetDescription: fieldsState.editPresetDescription,
    editSourceDay: fieldsState.editSourceDay,
    currentRoutines,
    setPresets,
    setEditingPresetId: targetState.setEditingPresetId,
    setEditingPresetUpdatedAt: targetState.setEditingPresetUpdatedAt,
    setEditPresetName: fieldsState.setEditPresetName,
    setEditPresetDescription: fieldsState.setEditPresetDescription,
    setEditSourceDay: fieldsState.setEditSourceDay,
  });

  return {
    editingPresetId: targetState.editingPresetId,
    editPresetName: fieldsState.editPresetName,
    editPresetDescription: fieldsState.editPresetDescription,
    editSourceDay: fieldsState.editSourceDay,
    setEditPresetName: fieldsState.setEditPresetName,
    setEditPresetDescription: fieldsState.setEditPresetDescription,
    setEditSourceDay: fieldsState.setEditSourceDay,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
  };
};
