import { LabeledField } from "@/components";
import {
  getRoutineNotificationPlaceholder,
  ROUTINE_FORM_DESCRIPTION_LABEL,
  ROUTINE_FORM_DESCRIPTION_PLACEHOLDER,
  ROUTINE_FORM_NOTIFICATION_BETA,
  ROUTINE_FORM_NOTIFICATION_HINT_PREFIX,
  ROUTINE_FORM_NOTIFICATION_HINT_SUFFIX,
  ROUTINE_FORM_NOTIFICATION_LABEL,
  ROUTINE_FORM_NOTIFICATION_PERMISSION_HINT,
  ROUTINE_FORM_WEEKLY_GOAL_ERROR,
  ROUTINE_FORM_WEEKLY_GOAL_HINT,
  ROUTINE_FORM_WEEKLY_GOAL_LABEL,
  ROUTINE_FORM_WEEKLY_GOAL_PLACEHOLDER,
} from "./helpers";

type RoutineFormOptionalFieldsProps = {
  description: string;
  setDescription: (value: string) => void;
  notificationMinutes: string;
  setNotificationMinutes: (value: string) => void;
  defaultNotificationMinutes: number;
  weeklyGoalTarget: string;
  setWeeklyGoalTarget: (value: string) => void;
  isWeeklyGoalTargetValid: boolean;
};

export const RoutineFormOptionalFields = ({
  description,
  setDescription,
  notificationMinutes,
  setNotificationMinutes,
  defaultNotificationMinutes,
  weeklyGoalTarget,
  setWeeklyGoalTarget,
  isWeeklyGoalTargetValid,
}: RoutineFormOptionalFieldsProps) => {
  return (
    <>
      <LabeledField label={ROUTINE_FORM_DESCRIPTION_LABEL}>
        {(inputId) => (
          <textarea
            id={inputId}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-white dark:text-gray-900"
            placeholder={ROUTINE_FORM_DESCRIPTION_PLACEHOLDER}
          />
        )}
      </LabeledField>

      <LabeledField label={ROUTINE_FORM_WEEKLY_GOAL_LABEL}>
        {(inputId) => (
          <>
            <input
              id={inputId}
              type="number"
              min="1"
              max="7"
              step="1"
              value={weeklyGoalTarget}
              onChange={(event) => setWeeklyGoalTarget(event.target.value)}
              aria-invalid={!isWeeklyGoalTargetValid}
              aria-describedby={`${inputId}-hint`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-white dark:text-gray-900"
              placeholder={ROUTINE_FORM_WEEKLY_GOAL_PLACEHOLDER}
            />
            <p
              id={`${inputId}-hint`}
              className={`text-xs mt-1 ${
                isWeeklyGoalTargetValid
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-red-600 dark:text-red-700"
              }`}
            >
              {isWeeklyGoalTargetValid
                ? ROUTINE_FORM_WEEKLY_GOAL_HINT
                : ROUTINE_FORM_WEEKLY_GOAL_ERROR}
            </p>
          </>
        )}
      </LabeledField>

      <LabeledField
        label={ROUTINE_FORM_NOTIFICATION_LABEL}
        labelClassName="block text-sm font-medium text-gray-700 dark:text-gray-300"
        labelAdornment={
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
            {ROUTINE_FORM_NOTIFICATION_BETA}
          </span>
        }
      >
        {(inputId) => (
          <>
            <input
              id={inputId}
              type="number"
              value={notificationMinutes}
              onChange={(event) => setNotificationMinutes(event.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-white dark:text-gray-900"
              placeholder={getRoutineNotificationPlaceholder(
                defaultNotificationMinutes,
              )}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {ROUTINE_FORM_NOTIFICATION_HINT_PREFIX}{" "}
              {defaultNotificationMinutes}
              {ROUTINE_FORM_NOTIFICATION_HINT_SUFFIX}
              <br />
              {ROUTINE_FORM_NOTIFICATION_PERMISSION_HINT}
            </p>
          </>
        )}
      </LabeledField>
    </>
  );
};
