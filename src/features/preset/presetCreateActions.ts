import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetAndReload } from "./presetCreateWorkflow";
import { PRESET_MANAGER_MESSAGES } from "./presetManagerPresentation";

type CreatePresetHandlerArgs = {
  currentRoutines: Routine[];
  newPresetName: string;
  newPresetDescription: string;
  sourceDay: number | null;
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
  setNewPresetName: Dispatch<SetStateAction<string>>;
  setNewPresetDescription: Dispatch<SetStateAction<string>>;
  setSourceDay: Dispatch<SetStateAction<number | null>>;
};

export const createPresetCreateHandler = ({
  currentRoutines,
  newPresetName,
  newPresetDescription,
  sourceDay,
  setPresets,
  setIsCreating,
  setNewPresetName,
  setNewPresetDescription,
  setSourceDay,
}: CreatePresetHandlerArgs) => {
  return () => {
    const {
      presets: nextPresets,
      created,
      failureReason,
    } = createPresetAndReload({
      currentRoutines,
      newPresetName,
      newPresetDescription,
      sourceDay,
    });
    if (!created) {
      if (failureReason === "invalid-input") {
        window.alert(PRESET_MANAGER_MESSAGES.alertMissingFields);
      }
      return;
    }
    setPresets(nextPresets);
    setIsCreating(false);
    setNewPresetName("");
    setNewPresetDescription("");
    setSourceDay(null);
  };
};
