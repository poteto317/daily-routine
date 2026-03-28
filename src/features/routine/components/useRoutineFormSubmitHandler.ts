import { useCallback } from "react";
import type { Routine } from "@/types/routine";
import { buildRoutineSubmitPayload } from "./routineFormModel";

export type SubmitAction = (
  routine: Omit<Routine, "id" | "createdAt" | "updatedAt">,
  groupDaysOfWeek?: number[],
) => void;

type UseRoutineFormSubmitHandlerParams = {
  routine?: Routine;
  title: string;
  category: Routine["category"];
  daysOfWeek: number[];
  startTime: string;
  duration: string;
  description: string;
  notificationMinutes: string;
  defaultDurationMinutes: number;
  groupDaysOfWeek: number[];
  hasConflict: boolean;
  onSubmit: SubmitAction;
};

export const useRoutineFormSubmitHandler = ({
  routine,
  title,
  category,
  daysOfWeek,
  startTime,
  duration,
  description,
  notificationMinutes,
  defaultDurationMinutes,
  groupDaysOfWeek,
  hasConflict,
  onSubmit,
}: UseRoutineFormSubmitHandlerParams) => {
  const isSubmitDisabled = daysOfWeek.length === 0 || hasConflict;

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (isSubmitDisabled) return;

      const { routineData, originalGroupDays } = buildRoutineSubmitPayload({
        routine,
        state: {
          title,
          category,
          daysOfWeek,
          startTime,
          duration,
          description,
          notificationMinutes,
        },
        defaultDurationMinutes,
        groupDaysOfWeek,
      });

      onSubmit(routineData, originalGroupDays);
    },
    [
      isSubmitDisabled,
      routine,
      title,
      category,
      daysOfWeek,
      startTime,
      duration,
      description,
      notificationMinutes,
      defaultDurationMinutes,
      groupDaysOfWeek,
      onSubmit,
    ],
  );

  return {
    isSubmitDisabled,
    handleSubmit,
  };
};
