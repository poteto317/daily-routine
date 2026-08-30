import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { cancelPresetEdit, startPresetEdit } from "./presetEditStateActions";
import { savePresetEditAndReload } from "./presetEditSaveWorkflow";
import {
  PRESET_EDIT_ALERT_MISSING_FIELDS,
  PRESET_EDIT_ALERT_PRESET_NOT_FOUND,
  PRESET_EDIT_SAVED_MESSAGE,
} from "./presetEditPresentation";

type PresetEditSetters = {
  setEditingPresetId: Dispatch<SetStateAction<string | null>>;
  setEditingPresetUpdatedAt: Dispatch<SetStateAction<string | null>>;
  setEditPresetName: Dispatch<SetStateAction<string>>;
  setEditPresetDescription: Dispatch<SetStateAction<string>>;
  setEditSourceDay: Dispatch<SetStateAction<number | null>>;
};

type StartEditHandlerArgs = PresetEditSetters & {
  presets: RoutinePreset[];
  setSelectedPresetId: Dispatch<SetStateAction<string | null>>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

type SaveEditHandlerArgs = PresetEditSetters & {
  presets: RoutinePreset[];
  editingPresetId: string | null;
  editingPresetUpdatedAt: string | null;
  editPresetName: string;
  editPresetDescription: string;
  editSourceDay: number | null;
  currentRoutines: Routine[];
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
};

export const applyCanceledPresetEdit = (setters: PresetEditSetters): void => {
  const nextState = cancelPresetEdit();
  setters.setEditingPresetId(nextState.editingPresetId);
  setters.setEditingPresetUpdatedAt(nextState.editingPresetUpdatedAt);
  setters.setEditPresetName(nextState.editPresetName);
  setters.setEditPresetDescription(nextState.editPresetDescription);
  setters.setEditSourceDay(nextState.editSourceDay);
};

export const createPresetStartEditHandler = ({
  presets,
  setEditingPresetId,
  setEditingPresetUpdatedAt,
  setEditPresetName,
  setEditPresetDescription,
  setEditSourceDay,
  setSelectedPresetId,
  setSelectedDays,
}: StartEditHandlerArgs) => {
  return (presetId: string) => {
    const nextState = startPresetEdit(presets, presetId);
    if (!nextState.editingPresetId) return;
    setEditingPresetId(nextState.editingPresetId);
    setEditingPresetUpdatedAt(nextState.editingPresetUpdatedAt);
    setEditPresetName(nextState.editPresetName);
    setEditPresetDescription(nextState.editPresetDescription);
    setEditSourceDay(nextState.editSourceDay);
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
  editingPresetUpdatedAt,
  editPresetName,
  editPresetDescription,
  editSourceDay,
  currentRoutines,
  setPresets,
  setEditingPresetId,
  setEditingPresetUpdatedAt,
  setEditPresetName,
  setEditPresetDescription,
  setEditSourceDay,
}: SaveEditHandlerArgs) => {
  return () => {
    const {
      presets: nextPresets,
      saved,
      failureReason,
    } = savePresetEditAndReload({
      presets,
      editingPresetId,
      editingPresetUpdatedAt,
      editPresetName,
      editPresetDescription,
      sourceDay: editSourceDay,
      currentRoutines,
    });
    if (!saved) {
      if (failureReason === "invalid-input") {
        window.alert(PRESET_EDIT_ALERT_MISSING_FIELDS);
      }
      if (
        failureReason === "preset-not-found" ||
        failureReason === "preset-conflict"
      ) {
        setPresets(nextPresets);
        window.alert(PRESET_EDIT_ALERT_PRESET_NOT_FOUND);
        applyCanceledPresetEdit({
          setEditingPresetId,
          setEditingPresetUpdatedAt,
          setEditPresetName,
          setEditPresetDescription,
          setEditSourceDay,
        });
      }
      return;
    }
    setPresets(nextPresets);
    window.alert(PRESET_EDIT_SAVED_MESSAGE);
    applyCanceledPresetEdit({
      setEditingPresetId,
      setEditingPresetUpdatedAt,
      setEditPresetName,
      setEditPresetDescription,
      setEditSourceDay,
    });
  };
};
