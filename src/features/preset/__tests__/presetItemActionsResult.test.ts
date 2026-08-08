import { createPresetItemActionsResult } from "../presetItemActionsResult";

describe("createPresetItemActionsResult", () => {
  it("apply/delete/duplicate action を公開 shape に載せる", () => {
    const handleApplyPreset = jest.fn();
    const handleDeletePreset = jest.fn();
    const handleDuplicatePreset = jest.fn();

    expect(
      createPresetItemActionsResult({
        handleApplyPreset,
        handleDeletePreset,
        handleDuplicatePreset,
      }),
    ).toEqual({
      handleApplyPreset,
      handleDeletePreset,
      handleDuplicatePreset,
    });
  });
});
