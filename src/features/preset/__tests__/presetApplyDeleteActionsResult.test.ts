import { createPresetApplyDeleteActionsResult } from "../presetApplyDeleteActionsResult";

describe("createPresetApplyDeleteActionsResult", () => {
  it("apply/delete action を公開 shape に載せる", () => {
    const handleApplyPreset = jest.fn();
    const handleDeletePreset = jest.fn();

    expect(
      createPresetApplyDeleteActionsResult({
        handleApplyPreset,
        handleDeletePreset,
      }),
    ).toEqual({
      handleApplyPreset,
      handleDeletePreset,
    });
  });
});
