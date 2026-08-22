import presetTexts from "./locales/ja.json";

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
