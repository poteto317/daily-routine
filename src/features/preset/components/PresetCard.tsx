import type { Routine, RoutinePreset} from "@/types/routine";
import { ROUTINE_CATEGORIES } from "@/types/routine";
import { DAY_LABELS } from "@/features/preset/presetConstants";
import {
  formatRoutineTemplateSummary,
  getDayButtonClassName,
  getPresetCardClassName,
  isApplyButtonDisabled,
  PRESET_APPLY_LABEL,
  PRESET_EDIT_LABEL,
  PRESET_ROUTINE_COUNT_SUFFIX,
} from "../helpers";
import { PresetEditSection } from "./PresetEditSection";

interface PresetCardProps {
  preset: RoutinePreset;
  isSelected: boolean;
  isEditing: boolean;
  selectedDays: Set<number>;
  editRoutines: Routine[];
  editPresetName: string;
  editPresetDescription: string;
  editSelectedRoutines: Set<string>;
  onSelect: () => void;
  onDelete: () => void;
  onToggleDay: (day: number) => void;
  onApply: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onChangeEditName: (name: string) => void;
  onChangeEditDescription: (desc: string) => void;
  onToggleEditRoutine: (routineId: string) => void;
}

export const PresetCard = ({
  preset,
  isSelected,
  isEditing,
  selectedDays,
  editRoutines,
  editPresetName,
  editPresetDescription,
  editSelectedRoutines,
  onSelect,
  onDelete,
  onToggleDay,
  onApply,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onChangeEditName,
  onChangeEditDescription,
  onToggleEditRoutine,
}: PresetCardProps) => (
  <div className={getPresetCardClassName(isSelected || isEditing)} onClick={onSelect}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {preset.name}
        </h4>
        {preset.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {preset.description}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {preset.routineTemplates.length} {PRESET_ROUTINE_COUNT_SUFFIX}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={(event) => {
            event.stopPropagation();
            onStartEdit();
          }}
          className="text-blue-400 hover:text-blue-600 p-2"
          aria-label="プリセットを編集"
        >
          {PRESET_EDIT_LABEL}
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 p-2"
          aria-label="プリセットを削除"
        >
          🗑️
        </button>
      </div>
    </div>

    {/* 編集モード */}
    {isEditing && (
      <PresetEditSection
        routines={editRoutines}
        editPresetName={editPresetName}
        editPresetDescription={editPresetDescription}
        editSelectedRoutines={editSelectedRoutines}
        onChangeEditName={onChangeEditName}
        onChangeEditDescription={onChangeEditDescription}
        onToggleEditRoutine={onToggleEditRoutine}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
      />
    )}

    {/* 適用モード（選択中かつ編集中でない場合） */}
    {isSelected && !isEditing && (
      <div className="mt-4 pt-4 border-t dark:border-gray-600">
        <div className="space-y-1 mb-4">
          {preset.routineTemplates.map((template, index) => {
            const categoryInfo = ROUTINE_CATEGORIES.find(
              (item) => item.value === template.category,
            );
            return (
              <div
                key={index}
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                {formatRoutineTemplateSummary({
                  categoryEmoji: categoryInfo?.emoji ?? "",
                  title: template.title,
                  startTime: template.startTime,
                  duration: template.duration,
                })}
              </div>
            );
          })}
        </div>

        <div className="mb-4 flex gap-2 flex-wrap">
          {DAY_LABELS.map((label, day) => (
            <button
              key={day}
              onClick={(event) => {
                event.stopPropagation();
                onToggleDay(day);
              }}
              className={getDayButtonClassName(selectedDays.has(day), day === 7)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onApply();
          }}
          disabled={isApplyButtonDisabled(selectedDays.size)}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          {PRESET_APPLY_LABEL}
        </button>
      </div>
    )}
  </div>
);
