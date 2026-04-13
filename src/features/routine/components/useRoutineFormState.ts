import type { Routine } from "@/types/routine";
import { useRoutineFormContextData } from "./useRoutineFormContextData";
import { useRoutineDayToggleAction } from "./useRoutineDayToggleAction";
import { useRoutineFormFieldsState } from "./useRoutineFormFieldsState";
import {
  useRoutineFormSubmitHandler,
  type SubmitAction,
} from "./useRoutineFormSubmitHandler";
import { createRoutineFormStateResult } from "./routineFormStateResult";
import { useRoutineConflictInfo } from "./useRoutineConflictInfo";

type UseRoutineFormStateParams = {
  routine?: Routine;
  currentDayOfWeek?: number;
  onSubmit: SubmitAction;
};

export const useRoutineFormState = ({
  routine,
  currentDayOfWeek,
  onSubmit,
}: UseRoutineFormStateParams) => {
  const contextData = useRoutineFormContextData({
    routine,
    currentDayOfWeek,
  });

  const fieldsState = useRoutineFormFieldsState(contextData.initialState);

  const conflictInfo = useRoutineConflictInfo({
    startTime: fieldsState.startTime,
    duration: fieldsState.duration,
    defaultDurationMinutes: contextData.defaultDurationMinutes,
    existingRoutines: contextData.existingRoutines,
    routineId: routine?.id,
    daysOfWeek: fieldsState.daysOfWeek,
  });

  const toggleDay = useRoutineDayToggleAction({
    setDaysOfWeek: fieldsState.setDaysOfWeek,
  });

  const submitState = useRoutineFormSubmitHandler({
    routine,
    title: fieldsState.title,
    category: fieldsState.category,
    daysOfWeek: fieldsState.daysOfWeek,
    startTime: fieldsState.startTime,
    duration: fieldsState.duration,
    description: fieldsState.description,
    notificationMinutes: fieldsState.notificationMinutes,
    defaultDurationMinutes: contextData.defaultDurationMinutes,
    hasConflict: conflictInfo.hasConflict,
    onSubmit,
  });

  return createRoutineFormStateResult({
    conflictInfo,
    contextData,
    fieldsState,
    submitState,
    toggleDay,
  });
};
