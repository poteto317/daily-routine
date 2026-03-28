import { renderHook } from "@testing-library/react";

jest.mock("../usePresetManagerBaseState", () => ({
  usePresetManagerBaseState: jest.fn(),
}));

jest.mock("../usePresetCreationState", () => ({
  usePresetCreationState: jest.fn(),
}));

jest.mock("../usePresetEditState", () => ({
  usePresetEditState: jest.fn(),
}));

jest.mock("../usePresetManagerActionHandlers", () => ({
  usePresetManagerActionHandlers: jest.fn(),
}));

jest.mock("../presetManagerStateResult", () => ({
  createPresetManagerStateResult: jest.fn(),
}));

import { createPresetManagerStateResult } from "../presetManagerStateResult";
import { usePresetCreationState } from "../usePresetCreationState";
import { usePresetEditState } from "../usePresetEditState";
import { usePresetManagerActionHandlers } from "../usePresetManagerActionHandlers";
import { usePresetManagerBaseState } from "../usePresetManagerBaseState";
import { usePresetManagerState } from "../usePresetManagerState";

describe("usePresetManagerState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("base/create/edit/actions/result builder を compose する", () => {
    const currentRoutines = [{ id: "r1" }] as never;
    const onApplyPreset = jest.fn();
    const baseState = {
      presets: [{ id: "p1" }],
      selectedPresetId: "p1",
      selectedDays: new Set([1]),
      setPresets: jest.fn(),
      setSelectedPresetId: jest.fn(),
      setSelectedDays: jest.fn(),
    };
    const creationState = { handleCreatePreset: jest.fn() };
    const editState = { handleSaveEdit: jest.fn() };
    const actionHandlers = {
      handleApplyPreset: jest.fn(),
      handleDeletePreset: jest.fn(),
      toggleDaySelection: jest.fn(),
    };
    const builtResult = { presetManager: true };

    (usePresetManagerBaseState as jest.Mock).mockReturnValue(baseState);
    (usePresetCreationState as jest.Mock).mockReturnValue(creationState);
    (usePresetEditState as jest.Mock).mockReturnValue(editState);
    (usePresetManagerActionHandlers as jest.Mock).mockReturnValue(
      actionHandlers,
    );
    (createPresetManagerStateResult as jest.Mock).mockReturnValue(builtResult);

    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    expect(usePresetManagerBaseState).toHaveBeenCalledTimes(1);
    expect(usePresetCreationState).toHaveBeenCalledWith({
      currentRoutines,
      setPresets: baseState.setPresets,
    });
    expect(usePresetEditState).toHaveBeenCalledWith({
      currentRoutines,
      presets: baseState.presets,
      setPresets: baseState.setPresets,
      setSelectedPresetId: baseState.setSelectedPresetId,
      setSelectedDays: baseState.setSelectedDays,
    });
    expect(usePresetManagerActionHandlers).toHaveBeenCalledWith({
      presets: baseState.presets,
      selectedPresetId: baseState.selectedPresetId,
      selectedDays: baseState.selectedDays,
      onApplyPreset,
      setPresets: baseState.setPresets,
      setSelectedPresetId: baseState.setSelectedPresetId,
      setSelectedDays: baseState.setSelectedDays,
    });
    expect(createPresetManagerStateResult).toHaveBeenCalledWith({
      actionHandlers,
      baseState,
      creationState,
      editState,
    });
    expect(result.current).toBe(builtResult);
  });
});
