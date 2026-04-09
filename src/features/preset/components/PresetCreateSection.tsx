import type { Routine } from "@/types/routine";
import { ROUTINE_CATEGORIES } from "@/types/routine";
import { DAY_LABELS } from "@/features/preset/presetConstants";
import {
  getDayButtonClassName,
  getPresetCreateToggleLabel,
  isPresetCreateDisabled,
  PRESET_CREATE_DESCRIPTION_PLACEHOLDER,
  PRESET_CREATE_EMPTY_ROUTINES_LABEL,
  PRESET_CREATE_FILTER_DAYS_LABEL,
  PRESET_CREATE_NAME_PLACEHOLDER,
  PRESET_CREATE_SUBMIT_LABEL,
} from "../helpers";

interface PresetCreateSectionProps {
  currentRoutines: Routine[];
  isCreating: boolean;
  newPresetName: string;
  newPresetDescription: string;
  selectedRoutines: Set<string>;
  createFilterDays: Set<number>;
  onToggleCreating: () => void;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
  onToggleRoutine: (routineId: string) => void;
  onToggleCreateFilterDay: (day: number) => void;
  onCreatePreset: () => void;
}

export const PresetCreateSection = ({
  currentRoutines,
  isCreating,
  newPresetName,
  newPresetDescription,
  selectedRoutines,
  createFilterDays,
  onToggleCreating,
  onChangeName,
  onChangeDescription,
  onToggleRoutine,
  onToggleCreateFilterDay,
  onCreatePreset,
}: PresetCreateSectionProps) => (
  <div className="mb-6">
    <button
      onClick={onToggleCreating}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      {getPresetCreateToggleLabel(isCreating)}
    </button>

    {isCreating && (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
        <input
          type="text"
          value={newPresetName}
          onChange={(event) => onChangeName(event.target.value)}
          className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white dark:border-gray-500"
          placeholder={PRESET_CREATE_NAME_PLACEHOLDER}
        />
        <textarea
          value={newPresetDescription}
          onChange={(event) => onChangeDescription(event.target.value)}
          className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white dark:border-gray-500"
          placeholder={PRESET_CREATE_DESCRIPTION_PLACEHOLDER}
          rows={2}
        />
        {/* 曜日フィルター */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {PRESET_CREATE_FILTER_DAYS_LABEL}
          </p>
          <div className="flex gap-2 flex-wrap">
            {DAY_LABELS.map((label, day) => (
              <button
                key={day}
                type="button"
                onClick={() => onToggleCreateFilterDay(day)}
                className={getDayButtonClassName(
                  createFilterDays.has(day),
                  day === 7,
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {currentRoutines.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              {PRESET_CREATE_EMPTY_ROUTINES_LABEL}
            </p>
          ) : (
            currentRoutines.map((routine) => {
              const categoryInfo = ROUTINE_CATEGORIES.find(
                (item) => item.value === routine.category,
              );
              return (
                <label
                  key={routine.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoutines.has(routine.id)}
                    onChange={() => onToggleRoutine(routine.id)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1 text-gray-900 dark:text-white">
                    {categoryInfo?.emoji} {routine.title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {routine.startTime}
                  </span>
                </label>
              );
            })
          )}
        </div>
        <button
          onClick={onCreatePreset}
          disabled={isPresetCreateDisabled(
            newPresetName,
            selectedRoutines.size,
          )}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          {PRESET_CREATE_SUBMIT_LABEL}
        </button>
      </div>
    )}
  </div>
);
