import type { Routine } from "@/types/routine";
import { PresetNameDescriptionFields } from "./PresetNameDescriptionFields";
import { PresetSourceDaySelection } from "./PresetSourceDaySelection";
import { createPresetSourceDayModel } from "../presetSourceDayModel";
import { isPresetSourceSaveDisabled } from "../presetSaveValidation";
import {
  PRESET_EDIT_CANCEL_LABEL,
  PRESET_EDIT_DESCRIPTION_PLACEHOLDER,
  PRESET_EDIT_EMPTY_ROUTINES_LABEL,
  PRESET_EDIT_NAME_PLACEHOLDER,
  PRESET_EDIT_SOURCE_DAY_LABEL,
  PRESET_EDIT_SAVE_LABEL,
} from "../presetEditPresentation";

interface PresetEditSectionProps {
  routines: Routine[];
  editPresetName: string;
  editPresetDescription: string;
  editSourceDay: number | null;
  onChangeEditName: (name: string) => void;
  onChangeEditDescription: (desc: string) => void;
  onSelectEditSourceDay: (day: number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export const PresetEditSection = ({
  routines,
  editPresetName,
  editPresetDescription,
  editSourceDay,
  onChangeEditName,
  onChangeEditDescription,
  onSelectEditSourceDay,
  onSaveEdit,
  onCancelEdit,
}: PresetEditSectionProps) => {
  const sourceDayModel = createPresetSourceDayModel(routines, editSourceDay);

  return (
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

      <PresetSourceDaySelection
        model={sourceDayModel}
        onSelectSourceDay={onSelectEditSourceDay}
        label={PRESET_EDIT_SOURCE_DAY_LABEL}
        emptyLabel={PRESET_EDIT_EMPTY_ROUTINES_LABEL}
      />

      {/* 保存 / キャンセル */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSaveEdit}
          disabled={isPresetSourceSaveDisabled(
            editPresetName,
            sourceDayModel.selectedRoutines.length,
          )}
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
};
