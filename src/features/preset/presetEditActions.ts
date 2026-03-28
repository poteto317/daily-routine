import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import {
  cancelPresetEdit,
  savePresetEditAndReload,
  startPresetEdit,
} from "./presetManagerStateActions";

type PresetEditSetters = {
  setEditingPresetId: Dispatch<SetStateAction<string | null>>;
  setEditPresetName: Dispatch<SetStateAction<string>>;
  setEditPresetDescription: Dispatch<SetStateAction<string>>;
  setEditSelectedRoutines: Dispatch<SetStateAction<Set<string>>>;
};

type StartEditHandlerArgs = PresetEditSetters & {
  presets: RoutinePreset[];
  setSelectedPresetId: Dispatch<SetStateAction<string | null>>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

type SaveEditHandlerArgs = PresetEditSetters & {
  presets: RoutinePreset[];
  editingPresetId: string | null;
  editPresetName: string;
  editPresetDescription: string;
  editSelectedRoutines: Set<string>;
  currentRoutines: Routine[];
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
};

export const applyCanceledPresetEdit = (setters: PresetEditSetters): void => {
  const nextState = cancelPresetEdit();
  setters.setEditingPresetId(nextState.editingPresetId);
  setters.setEditPresetName(nextState.editPresetName);
  setters.setEditPresetDescription(nextState.editPresetDescription);
  setters.setEditSelectedRoutines(nextState.editSelectedRoutines);
};

export const createPresetStartEditHandler = ({
  presets,
  setEditingPresetId,
  setEditPresetName,
  setEditPresetDescription,
  setEditSelectedRoutines,
  setSelectedPresetId,
  setSelectedDays,
}: StartEditHandlerArgs) => {
  return (presetId: string) => {
    const nextState = startPresetEdit(presets, presetId);
    if (!nextState.editingPresetId) return;
    setEditingPresetId(nextState.editingPresetId);
    setEditPresetName(nextState.editPresetName);
    setEditPresetDescription(nextState.editPresetDescription);
    setEditSelectedRoutines(nextState.editSelectedRoutines);
    setSelectedPresetId(null);
    setSelectedDays(new Set());
  };
};

export const createPresetCancelEditHandler = (setters: PresetEditSetters) => {
  return () => {
    applyCanceledPresetEdit(setters);
  };
};

export const createPresetSaveEditHandler = ({
  presets,
  editingPresetId,
  editPresetName,
  editPresetDescription,
  editSelectedRoutines,
  currentRoutines,
  setPresets,
  setEditingPresetId,
  setEditPresetName,
  setEditPresetDescription,
  setEditSelectedRoutines,
}: SaveEditHandlerArgs) => {
  return () => {
    const { presets: nextPresets, saved } = savePresetEditAndReload({
      presets,
      editingPresetId,
      editPresetName,
      editPresetDescription,
      editSelectedRoutines,
      currentRoutines,
    });
    if (!saved) return;
    setPresets(nextPresets);
    applyCanceledPresetEdit({
      setEditingPresetId,
      setEditPresetName,
      setEditPresetDescription,
      setEditSelectedRoutines,
    });
  };
};
