import { createPresetEditStateResult } from "../presetEditStateResult";

describe("createPresetEditStateResult", () => {
  it("edit state の公開 shape を返す", () => {
    const targetState = {
      editingPresetId: "p1",
      setEditingPresetId: jest.fn(),
    };
    const fieldsState = {
      editPresetName: "朝ルーティン",
      editPresetDescription: "更新済み",
      editSelectedRoutines: new Set(["r1"]),
      setEditPresetName: jest.fn(),
      setEditPresetDescription: jest.fn(),
      setEditSelectedRoutines: jest.fn(),
    };
    const handleStartEdit = jest.fn();
    const handleCancelEdit = jest.fn();
    const handleSaveEdit = jest.fn();
    const toggleEditRoutineSelection = jest.fn();

    const result = createPresetEditStateResult({
      targetState,
      fieldsState,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      toggleEditRoutineSelection,
    });

    expect(result).toEqual({
      editingPresetId: "p1",
      editPresetName: "朝ルーティン",
      editPresetDescription: "更新済み",
      editSelectedRoutines: fieldsState.editSelectedRoutines,
      setEditPresetName: fieldsState.setEditPresetName,
      setEditPresetDescription: fieldsState.setEditPresetDescription,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      toggleEditRoutineSelection,
    });
  });
});
