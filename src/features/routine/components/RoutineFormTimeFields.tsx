import { LabeledField } from "@/components";
import type { RoutineConflictInfo } from "./routineFormViewTypes";
import { RoutineTimeConflictWarning } from "./RoutineTimeConflictWarning";
import {
  getRoutineDurationInputClassName,
  getRoutineDurationPlaceholder,
  ROUTINE_FORM_DURATION_CONFLICT_LABEL,
  ROUTINE_FORM_DURATION_HINT_PREFIX,
  ROUTINE_FORM_DURATION_HINT_SUFFIX,
  ROUTINE_FORM_DURATION_LABEL,
  ROUTINE_FORM_START_TIME_LABEL,
  getRoutineTimeInputClassName,
} from "./routineFormTimePresentation";

type RoutineFormTimeFieldsProps = {
  startTime: string;
  setStartTime: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  defaultDurationMinutes: number;
  conflictInfo: RoutineConflictInfo;
};

export const RoutineFormTimeFields = ({
  startTime,
  setStartTime,
  duration,
  setDuration,
  defaultDurationMinutes,
  conflictInfo,
}: RoutineFormTimeFieldsProps) => {
  return (
    <>
      <LabeledField label={ROUTINE_FORM_START_TIME_LABEL}>
        {(inputId) => (
          <>
            <input
              id={inputId}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
              className={getRoutineTimeInputClassName(conflictInfo.hasConflict)}
            />
            <RoutineTimeConflictWarning conflictInfo={conflictInfo} />
          </>
        )}
      </LabeledField>

      <LabeledField label={ROUTINE_FORM_DURATION_LABEL}>
        {(inputId) => (
          <>
            <input
              id={inputId}
              type="number"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              min="1"
              max="1440"
              required
              className={getRoutineDurationInputClassName(
                conflictInfo.hasConflict,
              )}
              placeholder={getRoutineDurationPlaceholder(
                defaultDurationMinutes,
              )}
            />
            <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
              {ROUTINE_FORM_DURATION_HINT_PREFIX} {defaultDurationMinutes}
              {ROUTINE_FORM_DURATION_HINT_SUFFIX}
            </p>
            {conflictInfo.hasConflict && (
              <p className="text-xs text-red-600 dark:text-red-700 mt-1 font-medium">
                {ROUTINE_FORM_DURATION_CONFLICT_LABEL}
              </p>
            )}
          </>
        )}
      </LabeledField>
    </>
  );
};
