import { createPresetCreationStateResult } from "../presetCreationStateResult";

describe("createPresetCreationStateResult", () => {
  it("creation state の公開 shape を返す", () => {
    const formState = {
      isCreating: true,
      newPresetName: "朝",
      newPresetDescription: "朝用",
      setIsCreating: jest.fn(),
      setNewPresetName: jest.fn(),
      setNewPresetDescription: jest.fn(),
    };
    const selectionState = {
      selectedRoutines: new Set(["r1"]),
      createFilterDays: new Set([1]),
      setSelectedRoutines: jest.fn(),
      setCreateFilterDays: jest.fn(),
    };
    const handleCreatePreset = jest.fn();
    const toggleRoutineSelection = jest.fn();
    const toggleCreateFilterDay = jest.fn();

    const result = createPresetCreationStateResult({
      formState,
      selectionState,
      handleCreatePreset,
      toggleRoutineSelection,
      toggleCreateFilterDay,
    });

    expect(result).toEqual({
      isCreating: true,
      newPresetName: "朝",
      newPresetDescription: "朝用",
      selectedRoutines: selectionState.selectedRoutines,
      createFilterDays: selectionState.createFilterDays,
      setIsCreating: formState.setIsCreating,
      setNewPresetName: formState.setNewPresetName,
      setNewPresetDescription: formState.setNewPresetDescription,
      handleCreatePreset,
      toggleRoutineSelection,
      toggleCreateFilterDay,
    });
  });
});
