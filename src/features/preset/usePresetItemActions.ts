import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetApplyHandler } from "./presetApplyActions";
import { createPresetDeleteHandler } from "./presetDeleteActions";
import { createPresetDuplicateHandler } from "./presetDuplicateActions";

type UsePresetItemActionsParams = {
  presets: RoutinePreset[];
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  onApplyPreset: (
    routines: Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[],
    targetDays: number[],
  ) => void;
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
  setSelectedPresetId: Dispatch<SetStateAction<string | null>>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

export const usePresetItemActions = ({
  presets,
  selectedPresetId,
  selectedDays,
  onApplyPreset,
  setPresets,
  setSelectedPresetId,
  setSelectedDays,
}: UsePresetItemActionsParams) => {
  const handleDeletePreset = createPresetDeleteHandler({ setPresets });
  const handleApplyPreset = createPresetApplyHandler({
    presets,
    selectedPresetId,
    selectedDays,
    onApplyPreset,
    setSelectedPresetId,
    setSelectedDays,
  });
  const handleDuplicatePreset = createPresetDuplicateHandler({
    presets,
    setPresets,
  });

  return {
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
  };
};
