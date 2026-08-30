import { usePresetApplySelectionState } from "./usePresetApplySelectionState";
import { usePresetManagerPresetsState } from "./usePresetManagerPresetsState";

export const usePresetManagerBaseState = () => {
  const presetsState = usePresetManagerPresetsState();
  const selectionState = usePresetApplySelectionState();

  return { ...presetsState, ...selectionState };
};
