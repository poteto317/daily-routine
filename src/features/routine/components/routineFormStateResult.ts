import type { useRoutineConflictInfo } from "./useRoutineConflictInfo";
import type { useRoutineDayToggleAction } from "./useRoutineDayToggleAction";
import type { useRoutineFormContextData } from "./useRoutineFormContextData";
import type { useRoutineFormFieldsState } from "./useRoutineFormFieldsState";
import type { useRoutineFormSubmitHandler } from "./useRoutineFormSubmitHandler";

type RoutineFormContextData = ReturnType<typeof useRoutineFormContextData>;
type RoutineFormFieldsState = ReturnType<typeof useRoutineFormFieldsState>;
type RoutineConflictInfo = ReturnType<typeof useRoutineConflictInfo>;
type RoutineFormSubmitState = ReturnType<typeof useRoutineFormSubmitHandler>;
type RoutineDayToggleAction = ReturnType<typeof useRoutineDayToggleAction>;

type CreateRoutineFormStateResultParams = {
  conflictInfo: RoutineConflictInfo;
  contextData: RoutineFormContextData;
  fieldsState: RoutineFormFieldsState;
  submitState: RoutineFormSubmitState;
  toggleDay: RoutineDayToggleAction;
};

export const createRoutineFormStateResult = ({
  conflictInfo,
  contextData,
  fieldsState,
  submitState,
  toggleDay,
}: CreateRoutineFormStateResultParams) => {
  return {
    title: fieldsState.title,
    setTitle: fieldsState.setTitle,
    category: fieldsState.category,
    setCategory: fieldsState.setCategory,
    daysOfWeek: fieldsState.daysOfWeek,
    startTime: fieldsState.startTime,
    setStartTime: fieldsState.setStartTime,
    duration: fieldsState.duration,
    setDuration: fieldsState.setDuration,
    description: fieldsState.description,
    setDescription: fieldsState.setDescription,
    notificationMinutes: fieldsState.notificationMinutes,
    setNotificationMinutes: fieldsState.setNotificationMinutes,
    weeklyGoalTarget: fieldsState.weeklyGoalTarget,
    setWeeklyGoalTarget: fieldsState.setWeeklyGoalTarget,
    isWeeklyGoalTargetValid: submitState.isWeeklyGoalTargetValid,
    defaultNotificationMinutes: contextData.defaultNotificationMinutes,
    defaultDurationMinutes: contextData.defaultDurationMinutes,
    conflictInfo,
    toggleDay,
    handleSubmit: submitState.handleSubmit,
    isSubmitDisabled: submitState.isSubmitDisabled,
  };
};
