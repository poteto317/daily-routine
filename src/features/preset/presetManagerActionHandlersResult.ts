type PresetManagerActionHandlersResultArgs = {
  handleApplyPreset: () => void;
  handleDeletePreset: (presetId: string) => void;
  toggleDaySelection: (day: number) => void;
};

export const createPresetManagerActionHandlersResult = ({
  handleApplyPreset,
  handleDeletePreset,
  toggleDaySelection,
}: PresetManagerActionHandlersResultArgs) => {
  return {
    handleApplyPreset,
    handleDeletePreset,
    toggleDaySelection,
  };
};
