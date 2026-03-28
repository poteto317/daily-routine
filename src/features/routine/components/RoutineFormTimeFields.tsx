import type { RoutineConflictInfo } from "./routineFormViewTypes";
import {
  formatConflictRoutineLabel,
  getRoutineDurationInputClassName,
  getRoutineDurationPlaceholder,
  ROUTINE_FORM_CONFLICT_TITLE,
  ROUTINE_FORM_DURATION_CONFLICT_LABEL,
  ROUTINE_FORM_DURATION_HINT_PREFIX,
  ROUTINE_FORM_DURATION_HINT_SUFFIX,
  ROUTINE_FORM_DURATION_LABEL,
  ROUTINE_FORM_START_TIME_LABEL,
  getRoutineTimeInputClassName,
} from "./helpers";

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
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {ROUTINE_FORM_START_TIME_LABEL}
        </label>
        <input
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
          className={getRoutineTimeInputClassName(conflictInfo.hasConflict)}
        />
        {conflictInfo.hasConflict && (
          <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
            <p className="mb-1">{ROUTINE_FORM_CONFLICT_TITLE}</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              {conflictInfo.conflictingRoutines.map(
                ({ routine, commonDays }) => (
                  <li key={routine.id}>
                    {formatConflictRoutineLabel(routine.title, commonDays)})
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {ROUTINE_FORM_DURATION_LABEL}
        </label>
        <input
          type="number"
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
          min="1"
          max="1440"
          required
          className={getRoutineDurationInputClassName(conflictInfo.hasConflict)}
          placeholder={getRoutineDurationPlaceholder(defaultDurationMinutes)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {ROUTINE_FORM_DURATION_HINT_PREFIX} {defaultDurationMinutes}
          {ROUTINE_FORM_DURATION_HINT_SUFFIX}
        </p>
        {conflictInfo.hasConflict && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
            {ROUTINE_FORM_DURATION_CONFLICT_LABEL}
          </p>
        )}
      </div>
    </>
  );
};
