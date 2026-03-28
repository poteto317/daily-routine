import { usePresetApplySelectionState } from "./usePresetApplySelectionState";
import { createPresetManagerBaseStateResult } from "./presetManagerBaseStateResult";
import { usePresetManagerPresetsState } from "./usePresetManagerPresetsState";

export const usePresetManagerBaseState = () => {
  const presetsState = usePresetManagerPresetsState();
  const selectionState = usePresetApplySelectionState();

  return createPresetManagerBaseStateResult({
    presetsState,
    selectionState,
  });
};
