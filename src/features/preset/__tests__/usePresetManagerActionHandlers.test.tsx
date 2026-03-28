import { act, renderHook } from "@testing-library/react";

jest.mock("../usePresetApplyDeleteActions", () => ({
  usePresetApplyDeleteActions: jest.fn(),
}));

jest.mock("../usePresetDaySelectionAction", () => ({
  usePresetDaySelectionAction: jest.fn(),
}));

jest.mock("../presetManagerActionHandlersResult", () => ({
  createPresetManagerActionHandlersResult: jest.fn(),
}));

import { createPresetManagerActionHandlersResult } from "../presetManagerActionHandlersResult";
import { usePresetApplyDeleteActions } from "../usePresetApplyDeleteActions";
import { usePresetDaySelectionAction } from "../usePresetDaySelectionAction";
import { usePresetManagerActionHandlers } from "../usePresetManagerActionHandlers";

describe("usePresetManagerActionHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delete/apply/day toggle handler を組み立てて委譲する", () => {
    const handleDeletePreset = jest.fn();
    const handleApplyPreset = jest.fn();
    const toggleDaySelection = jest.fn();
    const resultShape = {
      handleDeletePreset: jest.fn(),
      handleApplyPreset: jest.fn(),
      toggleDaySelection: jest.fn(),
      composed: true,
    };

    (usePresetApplyDeleteActions as jest.Mock).mockReturnValue({
      handleDeletePreset,
      handleApplyPreset,
    });
    (usePresetDaySelectionAction as jest.Mock).mockReturnValue({
      toggleDaySelection,
    });
    (createPresetManagerActionHandlersResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      presets: [
        {
          id: "p1",
          name: "朝ルーティン",
          description: "desc",
          routineTemplates: [],
          createdAt: "2026-03-07T00:00:00.000Z",
          updatedAt: "2026-03-07T00:00:00.000Z",
        },
      ],
      selectedPresetId: "p1" as string | null,
      selectedDays: new Set([1]),
      onApplyPreset: jest.fn(),
      setPresets: jest.fn(),
      setSelectedPresetId: jest.fn(),
      setSelectedDays: jest.fn(),
    };

    const { result } = renderHook(() => usePresetManagerActionHandlers(params));

    expect(result.current).toBe(resultShape);
    expect(createPresetManagerActionHandlersResult).toHaveBeenCalledWith({
      handleDeletePreset,
      handleApplyPreset,
      toggleDaySelection,
    });

    const builtHandlers = (createPresetManagerActionHandlersResult as jest.Mock)
      .mock.calls[0][0] as {
      handleDeletePreset: (presetId: string) => void;
      handleApplyPreset: () => void;
      toggleDaySelection: (day: number) => void;
    };

    act(() => {
      builtHandlers.handleDeletePreset("p1");
      builtHandlers.handleApplyPreset();
      builtHandlers.toggleDaySelection(2);
    });

    expect(usePresetApplyDeleteActions).toHaveBeenCalledWith({
      presets: params.presets,
      selectedPresetId: "p1",
      selectedDays: params.selectedDays,
      onApplyPreset: params.onApplyPreset,
      setPresets: params.setPresets,
      setSelectedPresetId: params.setSelectedPresetId,
      setSelectedDays: params.setSelectedDays,
    });
    expect(usePresetDaySelectionAction).toHaveBeenCalledWith({
      selectedDays: params.selectedDays,
      setSelectedDays: params.setSelectedDays,
    });

    expect(handleDeletePreset).toHaveBeenCalledWith("p1");
    expect(handleApplyPreset).toHaveBeenCalled();
    expect(toggleDaySelection).toHaveBeenCalledWith(2);
  });
});
