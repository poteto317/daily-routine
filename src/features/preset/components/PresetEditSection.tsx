import type { Routine } from "@/types/routine";
import { toTimeOrderedSelectionGroups } from "../presetRoutineSelectionOrder";
import { PresetNameDescriptionFields } from "./PresetNameDescriptionFields";
import { RoutineSelectionList } from "./RoutineSelectionList";
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
      <PresetNameDescriptionFields
        name={editPresetName}
        description={editPresetDescription}
        namePlaceholder={PRESET_EDIT_NAME_PLACEHOLDER}
        descriptionPlaceholder={PRESET_EDIT_DESCRIPTION_PLACEHOLDER}
        onChangeName={onChangeEditName}
        onChangeDescription={onChangeEditDescription}
      />
    </div>

    {/* ルーティン選択 */}
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {PRESET_EDIT_ROUTINE_LIST_LABEL}
      </p>
      <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2 dark:border-gray-600">
        <RoutineSelectionList
          groups={toTimeOrderedSelectionGroups(routines)}
          selectedRoutineIds={editSelectedRoutines}
          onToggleRoutine={onToggleEditRoutine}
          emptyLabel={PRESET_EDIT_EMPTY_ROUTINES_LABEL}
        />
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
