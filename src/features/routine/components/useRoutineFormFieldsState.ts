import type { RoutineFormState } from "./routineFormModel";
import { useRoutineMetaFieldsState } from "./useRoutineMetaFieldsState";
import { useRoutineNotificationFieldState } from "./useRoutineNotificationFieldState";
import { useRoutineScheduleFieldsState } from "./useRoutineScheduleFieldsState";

export const useRoutineFormFieldsState = (initialState: RoutineFormState) => {
  const metaFieldsState = useRoutineMetaFieldsState({
    initialTitle: initialState.title,
    initialCategory: initialState.category,
    initialDescription: initialState.description,
  });
  const scheduleFieldsState = useRoutineScheduleFieldsState({
    initialDaysOfWeek: initialState.daysOfWeek,
    initialStartTime: initialState.startTime,
    initialDuration: initialState.duration,
  });
  const notificationFieldState = useRoutineNotificationFieldState({
    initialNotificationMinutes: initialState.notificationMinutes,
  });

  return {
    ...metaFieldsState,
    ...scheduleFieldsState,
    ...notificationFieldState,
  };
};
