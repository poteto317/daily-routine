import { createPresetApplyHandler } from "../presetApplyActions";

jest.mock("../presetApplyWorkflow", () => ({
  applyPresetSelection: jest.fn(),
}));

import { applyPresetSelection } from "../presetApplyWorkflow";

const preset = {
  id: "p1",
  name: "朝ルーティン",
  description: "desc",
  routineTemplates: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("createPresetApplyHandler", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("適用成功時だけ選択stateをリセットする", () => {
    (applyPresetSelection as jest.Mock)
      .mockReturnValueOnce({
        applied: false,
        presetName: null,
        failureReason: "preset-not-found",
      })
      .mockReturnValueOnce({
        applied: true,
        presetName: preset.name,
        failureReason: null,
      });
    const setSelectedPresetId = jest.fn();
    const setSelectedDays = jest.fn();
    const applyHandler = createPresetApplyHandler({
      presets: [preset],
      selectedPresetId: preset.id,
      selectedDays: new Set([1]),
      onApplyPreset: jest.fn(),
      setSelectedPresetId,
      setSelectedDays,
    });

    applyHandler();
    expect(setSelectedPresetId).not.toHaveBeenCalled();

    applyHandler();
    expect(setSelectedPresetId).toHaveBeenCalledWith(null);
    expect(setSelectedDays).toHaveBeenCalledWith(new Set());
  });

  it("適用workflowの入力不足をhandler層で通知する", () => {
    (applyPresetSelection as jest.Mock).mockReturnValue({
      applied: false,
      presetName: null,
      failureReason: "invalid-selection",
    });

    createPresetApplyHandler({
      presets: [preset],
      selectedPresetId: null,
      selectedDays: new Set(),
      onApplyPreset: jest.fn(),
      setSelectedPresetId: jest.fn(),
      setSelectedDays: jest.fn(),
    })();

    expect(window.alert).toHaveBeenCalledTimes(1);
  });
});
