import { createPresetManagerStateResult } from "../presetManagerStateResult";

describe("createPresetManagerStateResult", () => {
  it("base state と action/create/edit state を flat な公開 shape に組み立てる", () => {
    const setSelectedPresetId = jest.fn();
    const result = createPresetManagerStateResult({
      baseState: {
        presets: [{ id: "p1" } as never],
        selectedPresetId: "p1",
        selectedDays: new Set([1, 2]),
        setPresets: jest.fn(),
        setSelectedPresetId,
        setSelectedDays: jest.fn(),
      },
      actionHandlers: {
        handleApplyPreset: jest.fn(),
        handleDeletePreset: jest.fn(),
        toggleDaySelection: jest.fn(),
      },
      creationState: {
        isCreating: true,
        newPresetName: "朝",
        newPresetDescription: "desc",
        selectedRoutines: new Set(["r1"]),
        createFilterDays: new Set([1]),
        setIsCreating: jest.fn(),
        setNewPresetName: jest.fn(),
        setNewPresetDescription: jest.fn(),
        handleCreatePreset: jest.fn(),
        toggleRoutineSelection: jest.fn(),
        toggleCreateFilterDay: jest.fn(),
      },
      editState: {
        editingPresetId: "p1",
        editPresetName: "更新後",
        editPresetDescription: "new",
        editSelectedRoutines: new Set(["r2"]),
        setEditPresetName: jest.fn(),
        setEditPresetDescription: jest.fn(),
        handleStartEdit: jest.fn(),
        handleCancelEdit: jest.fn(),
        handleSaveEdit: jest.fn(),
        toggleEditRoutineSelection: jest.fn(),
      },
    });

    expect(result).toEqual({
      presets: [{ id: "p1" }],
      selectedPresetId: "p1",
      selectedDays: new Set([1, 2]),
      setSelectedPresetId,
      handleDeletePreset: expect.any(Function),
      handleApplyPreset: expect.any(Function),
      toggleDaySelection: expect.any(Function),
      isCreating: true,
      newPresetName: "朝",
      newPresetDescription: "desc",
      selectedRoutines: new Set(["r1"]),
      createFilterDays: new Set([1]),
      setIsCreating: expect.any(Function),
      setNewPresetName: expect.any(Function),
      setNewPresetDescription: expect.any(Function),
      handleCreatePreset: expect.any(Function),
      toggleRoutineSelection: expect.any(Function),
      toggleCreateFilterDay: expect.any(Function),
      editingPresetId: "p1",
      editPresetName: "更新後",
      editPresetDescription: "new",
      editSelectedRoutines: new Set(["r2"]),
      setEditPresetName: expect.any(Function),
      setEditPresetDescription: expect.any(Function),
      handleStartEdit: expect.any(Function),
      handleCancelEdit: expect.any(Function),
      handleSaveEdit: expect.any(Function),
      toggleEditRoutineSelection: expect.any(Function),
    });
  });
});
