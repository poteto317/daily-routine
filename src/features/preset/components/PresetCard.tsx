import { type Routine, type RoutinePreset } from "@/types/routine";
import {
  getPresetCardClassName,
  PRESET_ROUTINE_COUNT_SUFFIX,
} from "../helpers";
import { PresetEditSection } from "./PresetEditSection";
import { PresetApplySection } from "./PresetApplySection";
import { PresetCardEditButton } from "./PresetCardEditButton";
import { PresetCardDuplicateButton } from "./PresetCardDuplicateButton";
import { PresetCardDeleteButton } from "./PresetCardDeleteButton";

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
  onDuplicate: () => void;
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
  onDuplicate,
  onToggleDay,
  onApply,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onChangeEditName,
  onChangeEditDescription,
  onToggleEditRoutine,
}: PresetCardProps) => (
  <div
    className={getPresetCardClassName(isSelected || isEditing)}
    onClick={onSelect}
  >
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
        <PresetCardEditButton onClick={onStartEdit} />
        <PresetCardDuplicateButton onClick={onDuplicate} />
        <PresetCardDeleteButton onClick={onDelete} />
      </div>
    </div>

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

    {isSelected && !isEditing && (
      <PresetApplySection
        preset={preset}
        selectedDays={selectedDays}
        onToggleDay={onToggleDay}
        onApply={onApply}
      />
    )}
  </div>
);
