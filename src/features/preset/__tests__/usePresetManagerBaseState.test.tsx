import { renderHook } from "@testing-library/react";

jest.mock("../presetManagerBaseStateResult", () => ({
  createPresetManagerBaseStateResult: jest.fn(),
}));

jest.mock("../usePresetApplySelectionState", () => ({
  usePresetApplySelectionState: jest.fn(),
}));

jest.mock("../usePresetManagerPresetsState", () => ({
  usePresetManagerPresetsState: jest.fn(),
}));

import { usePresetApplySelectionState } from "../usePresetApplySelectionState";
import { createPresetManagerBaseStateResult } from "../presetManagerBaseStateResult";
import { usePresetManagerBaseState } from "../usePresetManagerBaseState";
import { usePresetManagerPresetsState } from "../usePresetManagerPresetsState";

describe("usePresetManagerBaseState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const presetsState = {
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
      setPresets: jest.fn(),
    };
    const selectionState = {
      selectedPresetId: null,
      selectedDays: new Set(),
      setSelectedPresetId: jest.fn(),
      setSelectedDays: jest.fn(),
    };
    (usePresetManagerPresetsState as jest.Mock).mockReturnValue(presetsState);
    (usePresetApplySelectionState as jest.Mock).mockReturnValue(selectionState);
    (createPresetManagerBaseStateResult as jest.Mock).mockReturnValue({
      ...presetsState,
      ...selectionState,
    });
  });

  it("preset list state と apply selection state を compose する", () => {
    const { result } = renderHook(() => usePresetManagerBaseState());

    expect(usePresetManagerPresetsState).toHaveBeenCalledTimes(1);
    expect(usePresetApplySelectionState).toHaveBeenCalledTimes(1);
    expect(createPresetManagerBaseStateResult).toHaveBeenCalledWith({
      presetsState: expect.objectContaining({
        presets: [expect.objectContaining({ id: "p1" })],
      }),
      selectionState: expect.objectContaining({
        selectedPresetId: null,
        selectedDays: new Set(),
      }),
    });
    expect(result.current).toEqual({
      presets: [expect.objectContaining({ id: "p1" })],
      setPresets: expect.any(Function),
      selectedPresetId: null,
      selectedDays: new Set(),
      setSelectedPresetId: expect.any(Function),
      setSelectedDays: expect.any(Function),
    });
  });
});
