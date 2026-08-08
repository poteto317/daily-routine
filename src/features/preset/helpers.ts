import presetTexts from "./locales/ja.json";

// Type definitions
type RoutineTemplateSummary = {
  categoryEmoji: string;
  title: string;
  startTime: string;
  duration: number;
};

// Manager constants and functions
export const PRESET_MANAGER_TEXT = {
  title: presetTexts.manager.title,
  description: presetTexts.manager.description,
} as const;

export const PRESET_MANAGER_MESSAGES = {
  alertMissingFields: presetTexts.manager.messages.alertMissingFields,
  confirmDeletePreset: presetTexts.manager.messages.confirmDeletePreset,
  alertNoSelectionForApply:
    presetTexts.manager.messages.alertNoSelectionForApply,
  alertPresetApplied: (presetName: string) =>
    presetTexts.manager.messages.alertPresetAppliedTemplate.replace(
      "{presetName}",
      presetName,
    ),
} as const;

// List section constants
export const PRESET_LIST_SECTION_TEXT = {
  title: presetTexts.listSection.title,
  empty: presetTexts.listSection.empty,
} as const;

// Card constants
export const PRESET_ROUTINE_COUNT_SUFFIX = presetTexts.card.routineCountSuffix;
export const PRESET_APPLY_LABEL = presetTexts.card.applyLabel;
export const PRESET_EDIT_LABEL = presetTexts.card.editLabel;
export const PRESET_DELETE_LABEL = presetTexts.card.deleteLabel;
export const PRESET_DUPLICATE_LABEL = presetTexts.card.duplicateLabel;

export const getPresetCardClassName = (isSelected: boolean): string => {
  return `p-4 border-2 rounded-lg cursor-pointer transition-all ${
    isSelected
      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
  }`;
};

export const getDayButtonClassName = (
  isSelected: boolean,
  isHoliday = false,
): string => {
  if (isHoliday) {
    return `px-3 py-2 rounded-lg transition-colors ${
      isSelected
        ? "bg-red-500 text-white"
        : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
    }`;
  }
  return `px-3 py-2 rounded-lg transition-colors ${
    isSelected
      ? "bg-blue-500 text-white"
      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
  }`;
};

export const isApplyButtonDisabled = (selectedDayCount: number): boolean => {
  return selectedDayCount === 0;
};

export const formatRoutineTemplateSummary = (
  summary: RoutineTemplateSummary,
): string => {
  return `${summary.categoryEmoji} ${summary.title} (${summary.startTime}, ${summary.duration}分)`;
};

// Create section constants
export const PRESET_CREATE_OPEN_LABEL = presetTexts.createSection.openLabel;
export const PRESET_CREATE_CANCEL_LABEL = presetTexts.createSection.cancelLabel;
export const PRESET_CREATE_NAME_PLACEHOLDER =
  presetTexts.createSection.namePlaceholder;
export const PRESET_CREATE_DESCRIPTION_PLACEHOLDER =
  presetTexts.createSection.descriptionPlaceholder;
export const PRESET_CREATE_FILTER_DAYS_LABEL =
  presetTexts.createSection.filterDaysLabel;
export const PRESET_CREATE_EMPTY_ROUTINES_LABEL =
  presetTexts.createSection.emptyRoutinesLabel;
export const PRESET_CREATE_SUBMIT_LABEL = presetTexts.createSection.submitLabel;

export const getPresetCreateToggleLabel = (isCreating: boolean): string => {
  return isCreating ? PRESET_CREATE_CANCEL_LABEL : PRESET_CREATE_OPEN_LABEL;
};

export const isPresetCreateDisabled = (
  name: string,
  selectedRoutineCount: number,
): boolean => {
  return !name.trim() || selectedRoutineCount === 0;
};

// Edit section constants
export const PRESET_EDIT_CANCEL_LABEL = presetTexts.editSection.cancelLabel;
export const PRESET_EDIT_SAVE_LABEL = presetTexts.editSection.saveLabel;
export const PRESET_EDIT_NAME_PLACEHOLDER =
  presetTexts.editSection.namePlaceholder;
export const PRESET_EDIT_DESCRIPTION_PLACEHOLDER =
  presetTexts.editSection.descriptionPlaceholder;
export const PRESET_EDIT_ROUTINE_LIST_LABEL =
  presetTexts.editSection.routineListLabel;
export const PRESET_EDIT_EMPTY_ROUTINES_LABEL =
  presetTexts.editSection.emptyRoutinesLabel;
export const PRESET_EDIT_SAVED_MESSAGE = presetTexts.editSection.savedMessage;
export const PRESET_EDIT_ALERT_MISSING_NAME =
  presetTexts.editSection.alertMissingName;

export const isPresetEditSaveDisabled = (name: string): boolean => {
  return !name.trim();
};
