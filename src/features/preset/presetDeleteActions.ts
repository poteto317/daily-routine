import type { Dispatch, SetStateAction } from "react";
import type { RoutinePreset } from "@/types/routine";
import { deletePresetAndReload } from "./presetDeleteWorkflow";
import { PRESET_MANAGER_MESSAGES } from "./presetManagerPresentation";

type DeletePresetHandlerArgs = {
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
};

export const createPresetDeleteHandler = ({
  setPresets,
}: DeletePresetHandlerArgs) => {
  return (presetId: string) => {
    if (!window.confirm(PRESET_MANAGER_MESSAGES.confirmDeletePreset)) return;
    setPresets(deletePresetAndReload(presetId));
  };
};
