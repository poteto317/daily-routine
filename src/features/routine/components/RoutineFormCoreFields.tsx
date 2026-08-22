import { FieldGroup, LabeledField } from "@/components";
import { ROUTINE_CATEGORIES } from "@/types/routine";
import { uiTextConfig } from "@/config";
import type { RoutineFormCoreProps } from "./routineFormViewTypes";
import {
  getRoutineCategoryButtonClassName,
  getRoutineDayButtonClassName,
  ROUTINE_FORM_CATEGORY_LABEL,
  ROUTINE_FORM_DAYS_CREATE_HINT,
  ROUTINE_FORM_DAYS_LABEL,
  ROUTINE_FORM_DAYS_WARNING_LABEL,
  ROUTINE_FORM_TITLE_LABEL,
  ROUTINE_FORM_TITLE_PLACEHOLDER,
} from "./routineFormCorePresentation";

const DAYS = uiTextConfig.days;

export const RoutineFormCoreFields = ({
  routine,
  category,
  setCategory,
  daysOfWeek,
  toggleDay,
  title,
  setTitle,
}: RoutineFormCoreProps) => {
  return (
    <>
      <LabeledField label={ROUTINE_FORM_TITLE_LABEL}>
        {(inputId) => (
          <input
            id={inputId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-white dark:text-gray-900"
            placeholder={ROUTINE_FORM_TITLE_PLACEHOLDER}
          />
        )}
      </LabeledField>

      {!routine && (
        <div>
          <FieldGroup
            label={ROUTINE_FORM_DAYS_LABEL}
            groupClassName="grid grid-cols-4 gap-2"
          >
            {DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                aria-pressed={daysOfWeek.includes(day.value)}
                onClick={() => toggleDay(day.value)}
                className={getRoutineDayButtonClassName({
                  isSelected: daysOfWeek.includes(day.value),
                  isHoliday: day.value === 7,
                })}
              >
                {day.label}
              </button>
            ))}
          </FieldGroup>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {daysOfWeek.length === 0 ? (
              <span className="text-red-600 dark:text-red-400 font-medium">
                {ROUTINE_FORM_DAYS_WARNING_LABEL}
              </span>
            ) : (
              ROUTINE_FORM_DAYS_CREATE_HINT
            )}
          </p>
        </div>
      )}

      <FieldGroup
        label={ROUTINE_FORM_CATEGORY_LABEL}
        groupClassName="grid grid-cols-3 gap-2"
      >
        {ROUTINE_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            className={getRoutineCategoryButtonClassName(
              cat.value,
              category,
              cat.color,
            )}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </FieldGroup>
    </>
  );
};
