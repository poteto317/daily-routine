import { act, renderHook } from "@testing-library/react";
import { createPresetEditStateResult } from "../presetEditStateResult";
import { usePresetEditState } from "../usePresetEditState";

jest.mock("../presetEditStateResult", () => ({
  createPresetEditStateResult: jest.fn(),
}));

jest.mock("../usePresetEditFieldsState", () => ({
  usePresetEditFieldsState: jest.fn(),
}));

jest.mock("../usePresetEditingTargetState", () => ({
  usePresetEditingTargetState: jest.fn(),
}));

jest.mock("../presetEditActions", () => ({
  createPresetCancelEditHandler: jest.fn(),
  createPresetSaveEditHandler: jest.fn(),
  createPresetStartEditHandler: jest.fn(),
}));

jest.mock("../presetSelectionActions", () => ({
  createPresetSelectionToggleHandler: jest.fn(),
}));

import {
  createPresetCancelEditHandler,
  createPresetSaveEditHandler,
  createPresetStartEditHandler,
} from "../presetEditActions";
import { usePresetEditFieldsState } from "../usePresetEditFieldsState";
import { usePresetEditingTargetState } from "../usePresetEditingTargetState";
import { createPresetSelectionToggleHandler } from "../presetSelectionActions";

const presets = [
  {
    id: "p1",
    name: "朝ルーティン",
    description: "desc",
    routineTemplates: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
];

const currentRoutines = [
  {
    id: "r1",
    title: "朝食",
    startTime: "07:00",
    duration: 30,
    category: "life" as const,
    daysOfWeek: [1],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
];

describe("usePresetEditState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("編集 handler と選択 handler を委譲する", () => {
    const startAction = jest.fn();
    const cancelAction = jest.fn();
    const saveAction = jest.fn();
    const toggleAction = jest.fn();
    const targetState = {
      editingPresetId: null,
      setEditingPresetId: jest.fn(),
    };
    const fieldsState = {
      editPresetName: "",
      editPresetDescription: "",
      editSelectedRoutines: new Set<string>(),
      setEditPresetName: jest.fn(),
      setEditPresetDescription: jest.fn(),
      setEditSelectedRoutines: jest.fn(),
    };
    (createPresetStartEditHandler as jest.Mock).mockReturnValue(startAction);
    (createPresetCancelEditHandler as jest.Mock).mockReturnValue(cancelAction);
    (createPresetSaveEditHandler as jest.Mock).mockReturnValue(saveAction);
    (createPresetSelectionToggleHandler as jest.Mock).mockReturnValue(
      toggleAction,
    );
    (usePresetEditingTargetState as jest.Mock).mockReturnValue(targetState);
    (usePresetEditFieldsState as jest.Mock).mockReturnValue(fieldsState);
    const editStateResult = {
      editingPresetId: null,
      editPresetName: "",
      editPresetDescription: "",
      editSelectedRoutines: fieldsState.editSelectedRoutines,
      setEditPresetName: fieldsState.setEditPresetName,
      setEditPresetDescription: fieldsState.setEditPresetDescription,
      handleStartEdit: startAction,
      handleCancelEdit: cancelAction,
      handleSaveEdit: saveAction,
      toggleEditRoutineSelection: toggleAction,
    };
    (createPresetEditStateResult as jest.Mock).mockReturnValue(editStateResult);

    const params = {
      currentRoutines,
      presets,
      setPresets: jest.fn(),
      setSelectedPresetId: jest.fn(),
      setSelectedDays: jest.fn(),
    };
    const { result } = renderHook(() => usePresetEditState(params));

    act(() => {
      result.current.setEditPresetName("更新後");
      result.current.setEditPresetDescription("新しい説明");
    });

    act(() => {
      result.current.handleStartEdit("p1");
      result.current.handleCancelEdit();
      result.current.handleSaveEdit();
      result.current.toggleEditRoutineSelection("r1");
    });

    expect(createPresetStartEditHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        presets,
        setEditingPresetId: targetState.setEditingPresetId,
        setSelectedPresetId: params.setSelectedPresetId,
        setSelectedDays: params.setSelectedDays,
      }),
    );
    expect(createPresetCancelEditHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        setEditingPresetId: expect.any(Function),
        setEditPresetName: expect.any(Function),
        setEditPresetDescription: expect.any(Function),
        setEditSelectedRoutines: expect.any(Function),
      }),
    );
    expect(createPresetSaveEditHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        presets,
        currentRoutines,
        editingPresetId: targetState.editingPresetId,
        editPresetName: "",
        editPresetDescription: "",
        editSelectedRoutines: fieldsState.editSelectedRoutines,
        setPresets: params.setPresets,
      }),
    );
    expect(createPresetSelectionToggleHandler).toHaveBeenCalledWith(
      fieldsState.editSelectedRoutines,
      fieldsState.setEditSelectedRoutines,
    );
    expect(createPresetEditStateResult).toHaveBeenCalledWith({
      targetState,
      fieldsState,
      handleStartEdit: startAction,
      handleCancelEdit: cancelAction,
      handleSaveEdit: saveAction,
      toggleEditRoutineSelection: toggleAction,
    });
    expect(startAction).toHaveBeenCalledWith("p1");
    expect(cancelAction).toHaveBeenCalled();
    expect(saveAction).toHaveBeenCalled();
    expect(toggleAction).toHaveBeenCalledWith("r1");
    expect(result.current).toBe(editStateResult);
  });
});
