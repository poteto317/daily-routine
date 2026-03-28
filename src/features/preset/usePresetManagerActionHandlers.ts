import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetManagerActionHandlersResult } from "./presetManagerActionHandlersResult";
import { usePresetApplyDeleteActions } from "./usePresetApplyDeleteActions";
import { usePresetDaySelectionAction } from "./usePresetDaySelectionAction";

type UsePresetManagerActionHandlersParams = {
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

export const usePresetManagerActionHandlers = ({
  presets,
  selectedPresetId,
  selectedDays,
  onApplyPreset,
  setPresets,
  setSelectedPresetId,
  setSelectedDays,
}: UsePresetManagerActionHandlersParams) => {
  const { handleApplyPreset, handleDeletePreset } = usePresetApplyDeleteActions(
    {
      presets,
      selectedPresetId,
      selectedDays,
      onApplyPreset,
      setPresets,
      setSelectedPresetId,
      setSelectedDays,
    },
  );
  const { toggleDaySelection } = usePresetDaySelectionAction({
    selectedDays,
    setSelectedDays,
  });

  return createPresetManagerActionHandlersResult({
    handleApplyPreset,
    handleDeletePreset,
    toggleDaySelection,
  });
};
