import { ROUTINE_CATEGORIES } from "@/types/routine";
import { uiTextConfig } from "@/config";
import type { RoutineFormCoreProps } from "./routineFormViewTypes";
import {
  getRoutineCategoryButtonClassName,
  getRoutineDayButtonClassName,
  ROUTINE_FORM_CATEGORY_LABEL,
  ROUTINE_FORM_DAYS_CREATE_HINT,
  ROUTINE_FORM_DAYS_EDIT_HINT,
  ROUTINE_FORM_DAYS_LABEL,
  ROUTINE_FORM_DAYS_WARNING_LABEL,
  ROUTINE_FORM_TITLE_LABEL,
  ROUTINE_FORM_TITLE_PLACEHOLDER,
} from "./helpers";

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
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {ROUTINE_FORM_TITLE_LABEL}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-white dark:text-gray-900"
          placeholder={ROUTINE_FORM_TITLE_PLACEHOLDER}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {ROUTINE_FORM_DAYS_LABEL}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={getRoutineDayButtonClassName({
                isSelected: daysOfWeek.includes(day.value),
                isHoliday: day.value === 7,
              })}
            >
              {day.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {daysOfWeek.length === 0 ? (
            <span className="text-red-600 dark:text-red-400 font-medium">
              {ROUTINE_FORM_DAYS_WARNING_LABEL}
            </span>
          ) : routine ? (
            ROUTINE_FORM_DAYS_EDIT_HINT
          ) : (
            ROUTINE_FORM_DAYS_CREATE_HINT
          )}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {ROUTINE_FORM_CATEGORY_LABEL}
        </label>
        <div className="grid grid-cols-3 gap-2">
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
        </div>
      </div>
    </>
  );
};
