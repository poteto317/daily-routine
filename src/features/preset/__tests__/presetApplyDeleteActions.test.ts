import {
  createPresetApplyHandler,
  createPresetDeleteHandler,
} from "../presetApplyDeleteActions";

jest.mock("../presetManagerStateActions", () => ({
  applyPresetSelection: jest.fn(),
  deletePresetAndReload: jest.fn(),
}));

import {
  applyPresetSelection,
  deletePresetAndReload,
} from "../presetManagerStateActions";

const preset = {
  id: "p1",
  name: "朝ルーティン",
  description: "desc",
  routineTemplates: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("presetApplyDeleteActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("削除・適用 handler が成功時のみ state を更新する", () => {
    (deletePresetAndReload as jest.Mock)
      .mockReturnValueOnce({ presets: [preset], deleted: false })
      .mockReturnValueOnce({ presets: [], deleted: true });
    (applyPresetSelection as jest.Mock)
      .mockReturnValueOnce({ applied: false })
      .mockReturnValueOnce({ applied: true });

    const setPresets = jest.fn();
    const setSelectedPresetId = jest.fn();
    const setSelectedDays = jest.fn();
    const onApplyPreset = jest.fn();

    const deleteHandler = createPresetDeleteHandler({ setPresets });
    deleteHandler("p1");
    deleteHandler("p1");
    expect(setPresets).toHaveBeenCalledTimes(1);

    const applyHandler = createPresetApplyHandler({
      presets: [preset],
      selectedPresetId: "p1",
      selectedDays: new Set([1]),
      onApplyPreset,
      setSelectedPresetId,
      setSelectedDays,
    });
    applyHandler();
    applyHandler();

    expect(setSelectedPresetId).toHaveBeenCalledWith(null);
    expect(setSelectedDays).toHaveBeenCalledWith(new Set());
  });
});
