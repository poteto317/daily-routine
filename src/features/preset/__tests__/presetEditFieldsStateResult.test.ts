import { createPresetEditFieldsStateResult } from "../presetEditFieldsStateResult";

describe("createPresetEditFieldsStateResult", () => {
  it("edit fields state の公開 shape を返す", () => {
    const setEditPresetDescription = jest.fn();
    const setEditPresetName = jest.fn();
    const setEditSelectedRoutines = jest.fn();

    expect(
      createPresetEditFieldsStateResult({
        editPresetDescription: "新しい説明",
        editPresetName: "更新後",
        editSelectedRoutines: new Set(["r1"]),
        setEditPresetDescription,
        setEditPresetName,
        setEditSelectedRoutines,
      }),
    ).toEqual({
      editPresetDescription: "新しい説明",
      editPresetName: "更新後",
      editSelectedRoutines: new Set(["r1"]),
      setEditPresetDescription,
      setEditPresetName,
      setEditSelectedRoutines,
    });
  });
});
