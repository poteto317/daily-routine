import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetApplyDeleteActionsResult } from "./presetApplyDeleteActionsResult";
import {
  createPresetApplyHandler,
  createPresetDeleteHandler,
} from "./presetApplyDeleteActions";
import { createPresetDuplicateHandler } from "./presetDuplicateActions";

type UsePresetApplyDeleteActionsParams = {
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

export const usePresetApplyDeleteActions = ({
  presets,
  selectedPresetId,
  selectedDays,
  onApplyPreset,
  setPresets,
  setSelectedPresetId,
  setSelectedDays,
}: UsePresetApplyDeleteActionsParams) => {
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

  return createPresetApplyDeleteActionsResult({
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
  });
};
