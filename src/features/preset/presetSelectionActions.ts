import type { Dispatch, SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import {
  resolveCreateFilterSelection,
  togglePresetSelection,
} from "./presetManagerStateActions";

type CreateFilterHandlerArgs = {
  currentRoutines: Routine[];
  createFilterDays: Set<number>;
  selectedRoutines: Set<string>;
  setCreateFilterDays: Dispatch<SetStateAction<Set<number>>>;
  setSelectedRoutines: Dispatch<SetStateAction<Set<string>>>;
};

export const createPresetSelectionToggleHandler = (
  selection: Set<string>,
  setSelection: Dispatch<SetStateAction<Set<string>>>,
) => {
  return (routineId: string) => {
    setSelection(togglePresetSelection(selection, routineId));
  };
};

export const createPresetDaySelectionToggleHandler = (
  selection: Set<number>,
  setSelection: Dispatch<SetStateAction<Set<number>>>,
) => {
  return (day: number) => {
    setSelection(togglePresetSelection(selection, day));
  };
};

export const createPresetFilterDayToggleHandler = ({
  currentRoutines,
  createFilterDays,
  selectedRoutines,
  setCreateFilterDays,
  setSelectedRoutines,
}: CreateFilterHandlerArgs) => {
  return (day: number) => {
    const { nextFilterDays, nextSelectedRoutines } =
      resolveCreateFilterSelection({
        currentRoutines,
        createFilterDays,
        selectedRoutines,
        day,
      });

    setCreateFilterDays(nextFilterDays);
    setSelectedRoutines(nextSelectedRoutines);
  };
};
