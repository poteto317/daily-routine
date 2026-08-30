import type { RoutinePreset } from "@/types/routine";

export const findPresetById = (
  presets: RoutinePreset[],
  presetId: string | null,
): RoutinePreset | undefined => {
  if (!presetId) return undefined;
  return presets.find((preset) => preset.id === presetId);
};
