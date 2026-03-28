import {
  addPreset,
  deletePreset,
  getPresets,
  savePresets,
  updatePreset,
} from "../storage";
import { createPreset } from "./storageTestFixtures";

describe("preset storage mutations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds a preset", () => {
    const preset = createPreset();
    addPreset(preset);
    expect(getPresets()).toEqual([preset]);
  });

  it("updates an existing preset", () => {
    const originalPreset = createPreset();
    savePresets([originalPreset]);

    const updatedPreset = { ...originalPreset, name: "更新後" };
    updatePreset(updatedPreset);

    const presets = getPresets();
    expect(presets[0].name).toBe("更新後");
    expect(presets[0].updatedAt).not.toBe(originalPreset.updatedAt);
  });

  it("deletes a preset", () => {
    savePresets([
      createPreset({ id: "preset1", name: "テスト1" }),
      createPreset({ id: "preset2", name: "テスト2" }),
    ]);

    deletePreset("preset1");

    const remaining = getPresets();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe("preset2");
  });
});
