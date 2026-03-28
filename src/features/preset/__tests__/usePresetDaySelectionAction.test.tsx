import { act, renderHook } from "@testing-library/react";

jest.mock("../presetSelectionActions", () => ({
  createPresetDaySelectionToggleHandler: jest.fn(),
}));

import { createPresetDaySelectionToggleHandler } from "../presetSelectionActions";
import { usePresetDaySelectionAction } from "../usePresetDaySelectionAction";

describe("usePresetDaySelectionAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("day toggle handler を組み立てて委譲する", () => {
    const toggleDaySelection = jest.fn();
    const setSelectedDays = jest.fn();
    const selectedDays = new Set([1]);

    (createPresetDaySelectionToggleHandler as jest.Mock).mockReturnValue(
      toggleDaySelection,
    );

    const { result } = renderHook(() =>
      usePresetDaySelectionAction({
        selectedDays,
        setSelectedDays,
      }),
    );

    act(() => {
      result.current.toggleDaySelection(2);
    });

    expect(createPresetDaySelectionToggleHandler).toHaveBeenCalledWith(
      selectedDays,
      setSelectedDays,
    );
    expect(toggleDaySelection).toHaveBeenCalledWith(2);
  });
});
