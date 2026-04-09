import type { MealType } from "@/types/routine";
import {
  MEAL_CANCEL_LABEL,
  MEAL_DESCRIPTION_LABEL,
  MEAL_DESCRIPTION_PLACEHOLDER,
  MEAL_NOTES_LABEL,
  MEAL_NOTES_PLACEHOLDER,
  MEAL_SAVE_LABEL,
  MEAL_TIME_LABEL,
  MEAL_TYPE_LABEL,
  MEAL_TYPE_OPTIONS,
} from "../helpers";

type MealInputFormProps = {
  descriptionInput: string;
  mealTypeInput: MealType;
  notesInput: string;
  timeInput: string;
  onCancel: () => void;
  onDescriptionChange: (value: string) => void;
  onMealTypeChange: (value: MealType) => void;
  onNotesChange: (value: string) => void;
  onSave: () => void;
  onTimeChange: (value: string) => void;
};

export const MealInputForm = ({
  descriptionInput,
  mealTypeInput,
  notesInput,
  timeInput,
  onCancel,
  onDescriptionChange,
  onMealTypeChange,
  onNotesChange,
  onSave,
  onTimeChange,
}: MealInputFormProps) => {
  return (
    <div className="space-y-4 mt-4 p-4 bg-white dark:bg-slate-50 rounded-lg border border-green-200">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
          {MEAL_TYPE_LABEL}
        </label>
        <select
          value={mealTypeInput}
          onChange={(e) => onMealTypeChange(e.target.value as MealType)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-white dark:text-gray-900"
        >
          {MEAL_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
          {MEAL_TIME_LABEL}
        </label>
        <input
          type="time"
          value={timeInput}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-white dark:text-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
          {MEAL_DESCRIPTION_LABEL}
        </label>
        <textarea
          value={descriptionInput}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-white dark:text-gray-900"
          placeholder={MEAL_DESCRIPTION_PLACEHOLDER}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
          {MEAL_NOTES_LABEL}
        </label>
        <input
          type="text"
          value={notesInput}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-white dark:text-gray-900"
          placeholder={MEAL_NOTES_PLACEHOLDER}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          {MEAL_SAVE_LABEL}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
        >
          {MEAL_CANCEL_LABEL}
        </button>
      </div>
    </div>
  );
};
