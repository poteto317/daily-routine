import type { RoutineConflictInfo } from "./routineFormViewTypes";
import {
  formatConflictRoutineLabel,
  ROUTINE_FORM_CONFLICT_TITLE,
} from "./helpers";

type RoutineTimeConflictWarningProps = {
  conflictInfo: RoutineConflictInfo;
};

/**
 * 開始時間がほかのルーティンと重なっているときの警告。
 *
 * 入力欄の並びと警告の見せ方は変えたくなる理由が別なので、時刻フィールドから
 * 切り離している。
 */
export const RoutineTimeConflictWarning = ({
  conflictInfo,
}: RoutineTimeConflictWarningProps) => {
  if (!conflictInfo.hasConflict) {
    return null;
  }

  return (
    <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
      <p className="mb-1">{ROUTINE_FORM_CONFLICT_TITLE}</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        {conflictInfo.conflictingRoutines.map(({ routine, commonDays }) => (
          <li key={routine.id}>
            {formatConflictRoutineLabel(routine.title, commonDays)})
          </li>
        ))}
      </ul>
    </div>
  );
};
