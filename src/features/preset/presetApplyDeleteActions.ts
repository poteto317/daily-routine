import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import {
  applyPresetSelection,
  deletePresetAndReload,
} from "./presetManagerStateActions";

type UsePresetManagerStateParams = {
  onApplyPreset: (
    routines: Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[],
    targetDays: number[],
  ) => void;
};

type DeletePresetHandlerArgs = {
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
};

type ApplyPresetHandlerArgs = {
  presets: RoutinePreset[];
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  onApplyPreset: UsePresetManagerStateParams["onApplyPreset"];
  setSelectedPresetId: Dispatch<SetStateAction<string | null>>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

export const createPresetDeleteHandler = ({
  setPresets,
}: DeletePresetHandlerArgs) => {
  return (presetId: string) => {
    const { presets: nextPresets, deleted } = deletePresetAndReload(presetId);
    if (!deleted) return;
    setPresets(nextPresets);
  };
};

export const createPresetApplyHandler = ({
  presets,
  selectedPresetId,
  selectedDays,
  onApplyPreset,
  setSelectedPresetId,
  setSelectedDays,
}: ApplyPresetHandlerArgs) => {
  return () => {
    const { applied } = applyPresetSelection({
      presets,
      selectedPresetId,
      selectedDays,
      onApplyPreset,
    });
    if (!applied) return;
    setSelectedPresetId(null);
    setSelectedDays(new Set());
  };
};
