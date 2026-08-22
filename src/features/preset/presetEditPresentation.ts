import presetTexts from "./locales/ja.json";

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

export const isPresetEditSaveDisabled = (name: string): boolean => !name.trim();
