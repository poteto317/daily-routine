import { type Routine, type RoutinePreset } from "@/types/routine";
import { PresetCard } from "./PresetCard";
import { PRESET_LIST_SECTION_TEXT } from "../presetListPresentation";

interface PresetListSectionProps {
  presets: RoutinePreset[];
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  editingPresetId: string | null;
  editRoutines: Routine[];
  editPresetName: string;
  editPresetDescription: string;
  editSelectedRoutines: Set<string>;
  onSelectPreset: (presetId: string | null) => void;
  onDeletePreset: (presetId: string) => void;
  onDuplicatePreset: (presetId: string) => void;
  onToggleDay: (day: number) => void;
  onApplyPreset: () => void;
  onStartEdit: (presetId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onChangeEditName: (name: string) => void;
  onChangeEditDescription: (desc: string) => void;
  onToggleEditRoutine: (routineId: string) => void;
}

export const PresetListSection = ({
  presets,
  selectedPresetId,
  selectedDays,
  editingPresetId,
  editRoutines,
  editPresetName,
  editPresetDescription,
  editSelectedRoutines,
  onSelectPreset,
  onDeletePreset,
  onDuplicatePreset,
  onToggleDay,
  onApplyPreset,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onChangeEditName,
  onChangeEditDescription,
  onToggleEditRoutine,
}: PresetListSectionProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
      {PRESET_LIST_SECTION_TEXT.title}
    </h3>

    {presets.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400">
        {PRESET_LIST_SECTION_TEXT.empty}
      </p>
    ) : (
      <div className="space-y-3">
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          const isEditing = editingPresetId === preset.id;
          return (
            <PresetCard
              key={preset.id}
              preset={preset}
              isSelected={isSelected}
              isEditing={isEditing}
              selectedDays={selectedDays}
              editRoutines={editRoutines}
              editPresetName={editPresetName}
              editPresetDescription={editPresetDescription}
              editSelectedRoutines={editSelectedRoutines}
              onSelect={() => onSelectPreset(isSelected ? null : preset.id)}
              onDelete={() => onDeletePreset(preset.id)}
              onDuplicate={() => onDuplicatePreset(preset.id)}
              onToggleDay={onToggleDay}
              onApply={onApplyPreset}
              onStartEdit={() => onStartEdit(preset.id)}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onChangeEditName={onChangeEditName}
              onChangeEditDescription={onChangeEditDescription}
              onToggleEditRoutine={onToggleEditRoutine}
            />
          );
        })}
      </div>
    )}
  </div>
);
