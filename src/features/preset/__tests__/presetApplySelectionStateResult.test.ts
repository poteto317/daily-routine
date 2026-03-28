import { createPresetApplySelectionStateResult } from "../presetApplySelectionStateResult";

describe("createPresetApplySelectionStateResult", () => {
  it("apply selection state の公開 shape を返す", () => {
    const setSelectedPresetId = jest.fn();
    const setSelectedDays = jest.fn();

    expect(
      createPresetApplySelectionStateResult({
        selectedPresetId: "p1",
        selectedDays: new Set([1, 2]),
        setSelectedPresetId,
        setSelectedDays,
      }),
    ).toEqual({
      selectedPresetId: "p1",
      selectedDays: new Set([1, 2]),
      setSelectedPresetId,
      setSelectedDays,
    });
  });
});
