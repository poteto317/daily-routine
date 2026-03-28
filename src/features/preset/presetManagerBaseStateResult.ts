type PresetsState = ReturnType<
  typeof import("./usePresetManagerPresetsState").usePresetManagerPresetsState
>;
type SelectionState = ReturnType<
  typeof import("./usePresetApplySelectionState").usePresetApplySelectionState
>;

type CreatePresetManagerBaseStateResultArgs = {
  presetsState: PresetsState;
  selectionState: SelectionState;
};

export const createPresetManagerBaseStateResult = ({
  presetsState,
  selectionState,
}: CreatePresetManagerBaseStateResultArgs) => ({
  ...presetsState,
  ...selectionState,
});
