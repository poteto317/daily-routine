import { type Routine, ROUTINE_CATEGORIES } from "@/types/routine";
import {
  isPresetEditSaveDisabled,
  PRESET_EDIT_CANCEL_LABEL,
  PRESET_EDIT_DESCRIPTION_PLACEHOLDER,
  PRESET_EDIT_EMPTY_ROUTINES_LABEL,
  PRESET_EDIT_NAME_PLACEHOLDER,
  PRESET_EDIT_ROUTINE_LIST_LABEL,
  PRESET_EDIT_SAVE_LABEL,
} from "../helpers";

interface PresetEditSectionProps {
  routines: Routine[];
  editPresetName: string;
  editPresetDescription: string;
  editSelectedRoutines: Set<string>;
  onChangeEditName: (name: string) => void;
  onChangeEditDescription: (desc: string) => void;
  onToggleEditRoutine: (routineId: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export const PresetEditSection = ({
  routines,
  editPresetName,
  editPresetDescription,
  editSelectedRoutines,
  onChangeEditName,
  onChangeEditDescription,
  onToggleEditRoutine,
  onSaveEdit,
  onCancelEdit,
}: PresetEditSectionProps) => (
  <div
    className="mt-4 pt-4 border-t dark:border-gray-600 space-y-4"
    onClick={(e) => e.stopPropagation()}
  >
    {/* 名前・説明 */}
    <div className="space-y-2">
      <input
        type="text"
        value={editPresetName}
        onChange={(e) => onChangeEditName(e.target.value)}
        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white dark:border-gray-500"
        placeholder={PRESET_EDIT_NAME_PLACEHOLDER}
      />
      <textarea
        value={editPresetDescription}
        onChange={(e) => onChangeEditDescription(e.target.value)}
        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white dark:border-gray-500"
        placeholder={PRESET_EDIT_DESCRIPTION_PLACEHOLDER}
        rows={2}
      />
    </div>

    {/* ルーティン選択 */}
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {PRESET_EDIT_ROUTINE_LIST_LABEL}
      </p>
      <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2 dark:border-gray-600">
        {routines.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {PRESET_EDIT_EMPTY_ROUTINES_LABEL}
          </p>
        ) : (
          routines.map((routine) => {
            const categoryInfo = ROUTINE_CATEGORIES.find(
              (item) => item.value === routine.category,
            );
            return (
              <label
                key={routine.id}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={editSelectedRoutines.has(routine.id)}
                  onChange={() => onToggleEditRoutine(routine.id)}
                  className="w-4 h-4"
                />
                <span className="flex-1 text-sm text-gray-900 dark:text-white">
                  {categoryInfo?.emoji} {routine.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {routine.startTime}
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>

    {/* 保存 / キャンセル */}
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onSaveEdit}
        disabled={isPresetEditSaveDisabled(editPresetName)}
        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
      >
        {PRESET_EDIT_SAVE_LABEL}
      </button>
      <button
        type="button"
        onClick={onCancelEdit}
        className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors"
      >
        {PRESET_EDIT_CANCEL_LABEL}
      </button>
    </div>
  </div>
);
