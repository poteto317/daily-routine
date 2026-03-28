import { useMemo } from "react";
import { getSettings } from "@/features/settings/storage";
import { getRoutines } from "@/features/routine/storage";

export const useRoutineFormSourceData = () => {
  const settings = useMemo(() => getSettings(), []);
  const existingRoutines = useMemo(() => getRoutines(), []);

  return {
    defaultDurationMinutes: settings.defaultDurationMinutes,
    defaultNotificationMinutes: settings.defaultNotificationMinutes,
    existingRoutines,
  };
};
