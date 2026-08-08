type PresetManagerActionHandlersResultArgs = {
  handleApplyPreset: () => void;
  handleDeletePreset: (presetId: string) => void;
  handleDuplicatePreset: (presetId: string) => void;
  toggleDaySelection: (day: number) => void;
};

export const createPresetManagerActionHandlersResult = ({
  handleApplyPreset,
  handleDeletePreset,
  handleDuplicatePreset,
  toggleDaySelection,
}: PresetManagerActionHandlersResultArgs) => {
  return {
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
    toggleDaySelection,
  };
};
