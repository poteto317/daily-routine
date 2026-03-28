import { createPresetManagerActionHandlersResult } from "../presetManagerActionHandlersResult";

describe("presetManagerActionHandlersResult", () => {
  it("preset manager handlers の公開 shape を組み立てる", () => {
    const handleDeletePreset = jest.fn();
    const handleApplyPreset = jest.fn();
    const toggleDaySelection = jest.fn();

    expect(
      createPresetManagerActionHandlersResult({
        handleDeletePreset,
        handleApplyPreset,
        toggleDaySelection,
      }),
    ).toEqual({
      handleDeletePreset,
      handleApplyPreset,
      toggleDaySelection,
    });
  });
});
