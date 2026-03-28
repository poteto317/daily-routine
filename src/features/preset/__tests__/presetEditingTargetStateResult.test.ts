import { createPresetEditingTargetStateResult } from "../presetEditingTargetStateResult";

describe("createPresetEditingTargetStateResult", () => {
  it("editing target state の公開 shape を返す", () => {
    const setEditingPresetId = jest.fn();

    expect(
      createPresetEditingTargetStateResult({
        editingPresetId: "p1",
        setEditingPresetId,
      }),
    ).toEqual({
      editingPresetId: "p1",
      setEditingPresetId,
    });
  });
});
