import type { Routine, RoutinePreset } from "@/types/routine";

export const toggleSetSelection = <T>(current: Set<T>, target: T): Set<T> => {
  const next = new Set(current);

  if (next.has(target)) {
    next.delete(target);
  } else {
    next.add(target);
  }

  return next;
};

export const canCreatePreset = (
  presetName: string,
  selectedRoutines: Set<string>,
): boolean => {
  return presetName.trim().length > 0 && selectedRoutines.size > 0;
};

export const canApplyPreset = (
  selectedPresetId: string | null,
  selectedDays: Set<number>,
): selectedPresetId is string => {
  return selectedPresetId !== null && selectedDays.size > 0;
};

export const getSelectedRoutinesForPreset = (
  currentRoutines: Routine[],
  selectedRoutines: Set<string>,
): Routine[] => {
  return currentRoutines.filter((routine) => selectedRoutines.has(routine.id));
};

export const findPresetById = (
  presets: RoutinePreset[],
  presetId: string | null,
): RoutinePreset | undefined => {
  if (!presetId) return undefined;
  return presets.find((preset) => preset.id === presetId);
};

/**
 * 選択された曜日でルーティンを絞り込む。
 * filterDays が空の場合はすべてのルーティンを返す。
 */
export const getRoutinesFilteredByDays = (
  routines: Routine[],
  filterDays: Set<number>,
): Routine[] => {
  if (filterDays.size === 0) return routines;
  return routines.filter((routine) =>
    routine.daysOfWeek.some((day) => filterDays.has(day)),
  );
};
