import type { Routine } from "@/types/routine";
import { PresetNameDescriptionFields } from "./PresetNameDescriptionFields";
import { PresetSourceDaySelection } from "./PresetSourceDaySelection";
import { createPresetSourceDayModel } from "../presetSourceDayModel";
import { isPresetSourceSaveDisabled } from "../presetSaveValidation";
import {
  getPresetCreateToggleLabel,
  PRESET_CREATE_DESCRIPTION_PLACEHOLDER,
  PRESET_CREATE_EMPTY_ROUTINES_LABEL,
  PRESET_CREATE_SOURCE_DAY_LABEL,
  PRESET_CREATE_NAME_PLACEHOLDER,
  PRESET_CREATE_SUBMIT_LABEL,
} from "../presetCreatePresentation";

interface PresetCreateSectionProps {
  currentRoutines: Routine[];
  isCreating: boolean;
  newPresetName: string;
  newPresetDescription: string;
  sourceDay: number | null;
  onToggleCreating: () => void;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
  onSelectSourceDay: (day: number) => void;
  onCreatePreset: () => void;
}

export const PresetCreateSection = ({
  currentRoutines,
  isCreating,
  newPresetName,
  newPresetDescription,
  sourceDay,
  onToggleCreating,
  onChangeName,
  onChangeDescription,
  onSelectSourceDay,
  onCreatePreset,
}: PresetCreateSectionProps) => {
  const sourceDayModel = createPresetSourceDayModel(currentRoutines, sourceDay);

  return (
    <div className="mb-6">
      <button
        onClick={onToggleCreating}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        {getPresetCreateToggleLabel(isCreating)}
      </button>

      {isCreating && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
          <PresetNameDescriptionFields
            name={newPresetName}
            description={newPresetDescription}
            namePlaceholder={PRESET_CREATE_NAME_PLACEHOLDER}
            descriptionPlaceholder={PRESET_CREATE_DESCRIPTION_PLACEHOLDER}
            onChangeName={onChangeName}
            onChangeDescription={onChangeDescription}
          />
          <PresetSourceDaySelection
            model={sourceDayModel}
            onSelectSourceDay={onSelectSourceDay}
            label={PRESET_CREATE_SOURCE_DAY_LABEL}
            emptyLabel={PRESET_CREATE_EMPTY_ROUTINES_LABEL}
          />
          <button
            onClick={onCreatePreset}
            disabled={isPresetSourceSaveDisabled(
              newPresetName,
              sourceDayModel.selectedRoutines.length,
            )}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            {PRESET_CREATE_SUBMIT_LABEL}
          </button>
        </div>
      )}
    </div>
  );
};
