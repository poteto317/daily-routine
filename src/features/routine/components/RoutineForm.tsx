"use client";

import { type Routine } from "@/types/routine";
import { useRoutineFormState } from "./useRoutineFormState";
import { RoutineFormHeader } from "./RoutineFormHeader";
import { RoutineFormCoreFields } from "./RoutineFormCoreFields";
import { RoutineFormTimeFields } from "./RoutineFormTimeFields";
import { RoutineFormOptionalFields } from "./RoutineFormOptionalFields";
import { RoutineFormFooter } from "./RoutineFormFooter";

interface RoutineFormProps {
  routine?: Routine;
  onSubmit: (
    routine: Omit<Routine, "id" | "createdAt" | "updatedAt">,
    groupDaysOfWeek?: number[],
  ) => void;
  onCancel: () => void;
  currentDayOfWeek?: number; // 現在表示中の曜日
}

export const RoutineForm = ({
  routine,
  onSubmit,
  onCancel,
  currentDayOfWeek,
}: RoutineFormProps) => {
  const {
    title,
    setTitle,
    category,
    setCategory,
    daysOfWeek,
    startTime,
    setStartTime,
    duration,
    setDuration,
    description,
    setDescription,
    notificationMinutes,
    setNotificationMinutes,
    defaultNotificationMinutes,
    defaultDurationMinutes,
    conflictInfo,
    toggleDay,
    handleSubmit,
    isSubmitDisabled,
  } = useRoutineFormState({
    routine,
    currentDayOfWeek,
    onSubmit,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-100 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <RoutineFormHeader isEditMode={Boolean(routine)} onCancel={onCancel} />

        <div className="overflow-y-auto p-6 pt-4 space-y-4">
          <RoutineFormCoreFields
            routine={routine}
            category={category}
            setCategory={setCategory}
            daysOfWeek={daysOfWeek}
            toggleDay={toggleDay}
            title={title}
            setTitle={setTitle}
          />
          <RoutineFormTimeFields
            startTime={startTime}
            setStartTime={setStartTime}
            duration={duration}
            setDuration={setDuration}
            defaultDurationMinutes={defaultDurationMinutes}
            conflictInfo={conflictInfo}
          />
          <RoutineFormOptionalFields
            description={description}
            setDescription={setDescription}
            notificationMinutes={notificationMinutes}
            setNotificationMinutes={setNotificationMinutes}
            defaultNotificationMinutes={defaultNotificationMinutes}
          />
        </div>

        <RoutineFormFooter
          isEditMode={Boolean(routine)}
          onCancel={onCancel}
          isSubmitDisabled={isSubmitDisabled}
        />
      </form>
    </div>
  );
};
