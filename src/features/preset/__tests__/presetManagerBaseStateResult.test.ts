import { createPresetManagerBaseStateResult } from "../presetManagerBaseStateResult";

describe("createPresetManagerBaseStateResult", () => {
  it("presets と selection の公開 shape を返す", () => {
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
      selectedDays: new Set<number>(),
      setSelectedPresetId: jest.fn(),
      setSelectedDays: jest.fn(),
    };

    const result = createPresetManagerBaseStateResult({
      presetsState,
      selectionState,
    });

    expect(result).toEqual({
      presets: [expect.objectContaining({ id: "p1" })],
      setPresets: presetsState.setPresets,
      selectedPresetId: null,
      selectedDays: new Set<number>(),
      setSelectedPresetId: selectionState.setSelectedPresetId,
      setSelectedDays: selectionState.setSelectedDays,
    });
  });
});
