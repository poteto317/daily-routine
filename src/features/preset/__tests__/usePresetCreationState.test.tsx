import { act, renderHook } from "@testing-library/react";
import { createPresetCreationStateResult } from "../presetCreationStateResult";
import { usePresetCreationState } from "../usePresetCreationState";

jest.mock("../presetCreationStateResult", () => ({
  createPresetCreationStateResult: jest.fn(),
}));

jest.mock("../usePresetCreationFormState", () => ({
  usePresetCreationFormState: jest.fn(),
}));

jest.mock("../usePresetCreationSelectionState", () => ({
  usePresetCreationSelectionState: jest.fn(),
}));

jest.mock("../presetCreateActions", () => ({
  createPresetCreateHandler: jest.fn(),
}));

jest.mock("../presetSelectionActions", () => ({
  createPresetFilterDayToggleHandler: jest.fn(),
  createPresetSelectionToggleHandler: jest.fn(),
}));

import { createPresetCreateHandler } from "../presetCreateActions";
import {
  createPresetFilterDayToggleHandler,
  createPresetSelectionToggleHandler,
} from "../presetSelectionActions";
import { usePresetCreationFormState } from "../usePresetCreationFormState";
import { usePresetCreationSelectionState } from "../usePresetCreationSelectionState";

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

describe("usePresetCreationState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("作成 handler と選択 handler を委譲する", () => {
    const createAction = jest.fn();
    const toggleRoutineAction = jest.fn();
    const toggleFilterAction = jest.fn();
    const formState = {
      isCreating: false,
      newPresetName: "",
      newPresetDescription: "",
      setIsCreating: jest.fn(),
      setNewPresetName: jest.fn(),
      setNewPresetDescription: jest.fn(),
    };
    const selectionState = {
      selectedRoutines: new Set<string>(),
      createFilterDays: new Set<number>(),
      setSelectedRoutines: jest.fn(),
      setCreateFilterDays: jest.fn(),
    };
    (createPresetCreateHandler as jest.Mock).mockReturnValue(createAction);
    (createPresetSelectionToggleHandler as jest.Mock).mockReturnValue(
      toggleRoutineAction,
    );
    (createPresetFilterDayToggleHandler as jest.Mock).mockReturnValue(
      toggleFilterAction,
    );
    (usePresetCreationFormState as jest.Mock).mockReturnValue(formState);
    (usePresetCreationSelectionState as jest.Mock).mockReturnValue(
      selectionState,
    );
    const creationStateResult = {
      isCreating: false,
      newPresetName: "",
      newPresetDescription: "",
      selectedRoutines: selectionState.selectedRoutines,
      createFilterDays: selectionState.createFilterDays,
      setIsCreating: formState.setIsCreating,
      setNewPresetName: formState.setNewPresetName,
      setNewPresetDescription: formState.setNewPresetDescription,
      handleCreatePreset: createAction,
      toggleRoutineSelection: toggleRoutineAction,
      toggleCreateFilterDay: toggleFilterAction,
    };
    (createPresetCreationStateResult as jest.Mock).mockReturnValue(
      creationStateResult,
    );

    const setPresets = jest.fn();
    const { result } = renderHook(() =>
      usePresetCreationState({ currentRoutines, setPresets }),
    );

    act(() => {
      result.current.handleCreatePreset();
      result.current.toggleRoutineSelection("r1");
      result.current.toggleCreateFilterDay(1);
    });

    expect(usePresetCreationFormState).toHaveBeenCalledTimes(1);
    expect(usePresetCreationSelectionState).toHaveBeenCalledTimes(1);

    expect(createPresetCreateHandler).toHaveBeenCalledWith({
      currentRoutines,
      newPresetName: "",
      newPresetDescription: "",
      selectedRoutines: selectionState.selectedRoutines,
      setPresets,
      setIsCreating: formState.setIsCreating,
      setNewPresetName: formState.setNewPresetName,
      setNewPresetDescription: formState.setNewPresetDescription,
      setSelectedRoutines: selectionState.setSelectedRoutines,
      setCreateFilterDays: selectionState.setCreateFilterDays,
    });
    expect(createPresetSelectionToggleHandler).toHaveBeenCalledWith(
      selectionState.selectedRoutines,
      selectionState.setSelectedRoutines,
    );
    expect(createPresetFilterDayToggleHandler).toHaveBeenCalledWith({
      currentRoutines,
      createFilterDays: selectionState.createFilterDays,
      selectedRoutines: selectionState.selectedRoutines,
      setCreateFilterDays: selectionState.setCreateFilterDays,
      setSelectedRoutines: selectionState.setSelectedRoutines,
    });
    expect(createPresetCreationStateResult).toHaveBeenCalledWith({
      formState,
      selectionState,
      handleCreatePreset: createAction,
      toggleRoutineSelection: toggleRoutineAction,
      toggleCreateFilterDay: toggleFilterAction,
    });
    expect(createAction).toHaveBeenCalled();
    expect(toggleRoutineAction).toHaveBeenCalledWith("r1");
    expect(toggleFilterAction).toHaveBeenCalledWith(1);
    expect(result.current).toBe(creationStateResult);
  });
});
