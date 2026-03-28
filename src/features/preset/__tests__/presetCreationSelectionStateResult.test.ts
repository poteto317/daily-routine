import { createPresetCreationSelectionStateResult } from "../presetCreationSelectionStateResult";

describe("createPresetCreationSelectionStateResult", () => {
  it("creation selection state の公開 shape を返す", () => {
    const setCreateFilterDays = jest.fn();
    const setSelectedRoutines = jest.fn();

    expect(
      createPresetCreationSelectionStateResult({
        createFilterDays: new Set([1, 2]),
        selectedRoutines: new Set(["r1"]),
        setCreateFilterDays,
        setSelectedRoutines,
      }),
    ).toEqual({
      createFilterDays: new Set([1, 2]),
      selectedRoutines: new Set(["r1"]),
      setCreateFilterDays,
      setSelectedRoutines,
    });
  });
});
