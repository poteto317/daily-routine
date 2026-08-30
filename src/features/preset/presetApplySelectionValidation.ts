export const canApplyPreset = (
  selectedPresetId: string | null,
  selectedDays: Set<number>,
): selectedPresetId is string =>
  selectedPresetId !== null && selectedDays.size > 0;
