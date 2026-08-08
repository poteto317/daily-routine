type PresetItemActionsResultArgs = {
  handleApplyPreset: () => void;
  handleDeletePreset: (presetId: string) => void;
  handleDuplicatePreset: (presetId: string) => void;
};

export const createPresetItemActionsResult = ({
  handleApplyPreset,
  handleDeletePreset,
  handleDuplicatePreset,
}: PresetItemActionsResultArgs) => {
  return {
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
  };
};
