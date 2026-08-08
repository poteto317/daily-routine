type PresetApplyDeleteActionsResultArgs = {
  handleApplyPreset: () => void;
  handleDeletePreset: (presetId: string) => void;
  handleDuplicatePreset: (presetId: string) => void;
};

export const createPresetApplyDeleteActionsResult = ({
  handleApplyPreset,
  handleDeletePreset,
  handleDuplicatePreset,
}: PresetApplyDeleteActionsResultArgs) => {
  return {
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
  };
};
