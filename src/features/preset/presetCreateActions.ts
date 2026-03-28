import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetAndReload } from "./presetManagerStateActions";

type CreatePresetHandlerArgs = {
  currentRoutines: Routine[];
  newPresetName: string;
  newPresetDescription: string;
  selectedRoutines: Set<string>;
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
  setNewPresetName: Dispatch<SetStateAction<string>>;
  setNewPresetDescription: Dispatch<SetStateAction<string>>;
  setSelectedRoutines: Dispatch<SetStateAction<Set<string>>>;
  setCreateFilterDays: Dispatch<SetStateAction<Set<number>>>;
};

export const createPresetCreateHandler = ({
  currentRoutines,
  newPresetName,
  newPresetDescription,
  selectedRoutines,
  setPresets,
  setIsCreating,
  setNewPresetName,
  setNewPresetDescription,
  setSelectedRoutines,
  setCreateFilterDays,
}: CreatePresetHandlerArgs) => {
  return () => {
    const { presets: nextPresets, created } = createPresetAndReload({
      currentRoutines,
      newPresetName,
      newPresetDescription,
      selectedRoutines,
    });
    if (!created) return;
    setPresets(nextPresets);
    setIsCreating(false);
    setNewPresetName("");
    setNewPresetDescription("");
    setSelectedRoutines(new Set());
    setCreateFilterDays(new Set());
  };
};
