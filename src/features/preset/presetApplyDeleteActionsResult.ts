type PresetApplyDeleteActionsResultArgs = {
  handleApplyPreset: () => void;
  handleDeletePreset: (presetId: string) => void;
};

export const createPresetApplyDeleteActionsResult = ({
  handleApplyPreset,
  handleDeletePreset,
}: PresetApplyDeleteActionsResultArgs) => {
  return {
    handleApplyPreset,
    handleDeletePreset,
  };
};
