import { createPresetApplyDeleteActionsResult } from "../presetApplyDeleteActionsResult";

describe("createPresetApplyDeleteActionsResult", () => {
  it("apply/delete/duplicate action を公開 shape に載せる", () => {
    const handleApplyPreset = jest.fn();
    const handleDeletePreset = jest.fn();
    const handleDuplicatePreset = jest.fn();

    expect(
      createPresetApplyDeleteActionsResult({
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
