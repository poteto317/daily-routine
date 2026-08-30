import type { Dispatch, SetStateAction } from "react";
import type { RoutinePreset } from "@/types/routine";
import { duplicatePresetAndReload } from "./presetDuplicateWorkflow";

type DuplicatePresetHandlerArgs = {
  presets: RoutinePreset[];
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
};

export const createPresetDuplicateHandler = ({
  presets,
  setPresets,
}: DuplicatePresetHandlerArgs) => {
  return (presetId: string) => {
    const { presets: nextPresets, duplicated } = duplicatePresetAndReload(
      presets,
      presetId,
    );
    if (!duplicated) return;
    setPresets(nextPresets);
  };
};
