import { useState } from "react";
import type { RoutinePreset } from "@/types/routine";
import { getPresets } from "@/features/preset/storage";

export const usePresetManagerPresetsState = () => {
  const [presets, setPresets] = useState<RoutinePreset[]>(() => getPresets());

  return {
    presets,
    setPresets,
  };
};
