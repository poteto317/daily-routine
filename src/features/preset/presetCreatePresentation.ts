import presetTexts from "./locales/ja.json";

export const PRESET_CREATE_OPEN_LABEL = presetTexts.createSection.openLabel;
export const PRESET_CREATE_CANCEL_LABEL = presetTexts.createSection.cancelLabel;
export const PRESET_CREATE_NAME_PLACEHOLDER =
  presetTexts.createSection.namePlaceholder;
export const PRESET_CREATE_DESCRIPTION_PLACEHOLDER =
  presetTexts.createSection.descriptionPlaceholder;
export const PRESET_CREATE_SOURCE_DAY_LABEL =
  presetTexts.createSection.sourceDayLabel;
export const PRESET_CREATE_EMPTY_ROUTINES_LABEL =
  presetTexts.createSection.emptyRoutinesLabel;
export const PRESET_CREATE_SUBMIT_LABEL = presetTexts.createSection.submitLabel;

export const getPresetCreateToggleLabel = (isCreating: boolean): string =>
  isCreating ? PRESET_CREATE_CANCEL_LABEL : PRESET_CREATE_OPEN_LABEL;
