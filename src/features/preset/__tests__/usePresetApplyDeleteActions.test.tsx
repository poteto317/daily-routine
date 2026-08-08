import { act, renderHook } from "@testing-library/react";

jest.mock("../presetApplyDeleteActionsResult", () => ({
  createPresetApplyDeleteActionsResult: jest.fn(),
}));

jest.mock("../presetApplyDeleteActions", () => ({
  createPresetApplyHandler: jest.fn(),
  createPresetDeleteHandler: jest.fn(),
}));

jest.mock("../presetDuplicateActions", () => ({
  createPresetDuplicateHandler: jest.fn(),
}));

import { createPresetApplyDeleteActionsResult } from "../presetApplyDeleteActionsResult";
import {
  createPresetApplyHandler,
  createPresetDeleteHandler,
} from "../presetApplyDeleteActions";
import { createPresetDuplicateHandler } from "../presetDuplicateActions";
import { usePresetApplyDeleteActions } from "../usePresetApplyDeleteActions";

describe("usePresetApplyDeleteActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createPresetApplyDeleteActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });

  it("delete/apply/duplicate handler を組み立てて委譲する", () => {
    const handleDeletePreset = jest.fn();
    const handleApplyPreset = jest.fn();
    const handleDuplicatePreset = jest.fn();
    const resultShape = {
      handleDeletePreset: jest.fn(),
      handleApplyPreset: jest.fn(),
      handleDuplicatePreset: jest.fn(),
      composed: true,
    };

    (createPresetDeleteHandler as jest.Mock).mockReturnValue(
      handleDeletePreset,
    );
    (createPresetApplyHandler as jest.Mock).mockReturnValue(handleApplyPreset);
    (createPresetDuplicateHandler as jest.Mock).mockReturnValue(
      handleDuplicatePreset,
    );
    (createPresetApplyDeleteActionsResult as jest.Mock).mockReturnValue(
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

    const { result } = renderHook(() => usePresetApplyDeleteActions(params));

    expect(result.current).toBe(resultShape);
    expect(createPresetApplyDeleteActionsResult).toHaveBeenCalledWith({
      handleDeletePreset: expect.any(Function),
      handleApplyPreset: expect.any(Function),
      handleDuplicatePreset: expect.any(Function),
    });

    const builtHandlers = (createPresetApplyDeleteActionsResult as jest.Mock)
      .mock.calls[0][0] as {
      handleDeletePreset: (presetId: string) => void;
      handleApplyPreset: () => void;
      handleDuplicatePreset: (presetId: string) => void;
    };

    act(() => {
      builtHandlers.handleDeletePreset("p1");
      builtHandlers.handleApplyPreset();
      builtHandlers.handleDuplicatePreset("p1");
    });

    expect(createPresetDeleteHandler).toHaveBeenCalledWith({
      setPresets: params.setPresets,
    });
    expect(createPresetApplyHandler).toHaveBeenCalledWith({
      presets: params.presets,
      selectedPresetId: "p1",
      selectedDays: params.selectedDays,
      onApplyPreset: params.onApplyPreset,
      setSelectedPresetId: params.setSelectedPresetId,
      setSelectedDays: params.setSelectedDays,
    });
    expect(createPresetDuplicateHandler).toHaveBeenCalledWith({
      presets: params.presets,
      setPresets: params.setPresets,
    });
    expect(handleDeletePreset).toHaveBeenCalledWith("p1");
    expect(handleApplyPreset).toHaveBeenCalled();
    expect(handleDuplicatePreset).toHaveBeenCalledWith("p1");
  });
});
