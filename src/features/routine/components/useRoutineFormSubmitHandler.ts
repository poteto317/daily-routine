import { useCallback } from "react";
import type { Routine } from "@/types/routine";
import { buildRoutineSubmitPayload } from "./routineFormModel";

export type SubmitAction = (
  routine: Omit<Routine, "id" | "createdAt" | "updatedAt">,
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
  hasConflict,
  onSubmit,
}: UseRoutineFormSubmitHandlerParams) => {
  const isSubmitDisabled = daysOfWeek.length === 0 || hasConflict;

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (isSubmitDisabled) return;

      const { routineData } = buildRoutineSubmitPayload({
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
      });

      onSubmit(routineData);
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
      onSubmit,
    ],
  );

  return {
    isSubmitDisabled,
    handleSubmit,
  };
};
