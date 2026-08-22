import type { RoutinePreset } from "@/types/routine";
import { createPresetDuplicateHandler } from "../presetDuplicateActions";

jest.mock("../presetCrudStateActions", () => ({
  duplicatePresetAndReload: jest.fn(),
}));

import { duplicatePresetAndReload } from "../presetCrudStateActions";

const preset: RoutinePreset = {
  id: "p1",
  name: "朝ルーティン",
  description: "desc",
  routineTemplates: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("presetDuplicateActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("複製 handler が成功時のみ state を更新する", () => {
    (duplicatePresetAndReload as jest.Mock)
      .mockReturnValueOnce({ presets: [preset], duplicated: false })
      .mockReturnValueOnce({ presets: [preset, preset], duplicated: true });

    const setPresets = jest.fn();
    const duplicateHandler = createPresetDuplicateHandler({
      presets: [preset],
      setPresets,
    });

    duplicateHandler("missing");
    expect(setPresets).not.toHaveBeenCalled();

    duplicateHandler("p1");
    expect(duplicatePresetAndReload).toHaveBeenCalledWith([preset], "p1");
    expect(setPresets).toHaveBeenCalledTimes(1);
    expect(setPresets).toHaveBeenCalledWith([preset, preset]);
  });
});
