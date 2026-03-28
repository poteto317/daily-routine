import {
  createPresetFromRoutines,
  createRoutinesFromPreset,
  getPresets,
  savePresets,
} from "../storage";
import { createPreset, sampleRoutines } from "./storageTestFixtures";

describe("preset storage data/factory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when no presets are saved", () => {
    expect(getPresets()).toEqual([]);
  });

  it("saves and loads presets", () => {
    const presets = [createPreset()];
    savePresets(presets);
    expect(getPresets()).toEqual(presets);
  });

  it("creates a preset from routines", () => {
    const preset = createPresetFromRoutines(
      "モーニング",
      sampleRoutines,
      "朝のルーティン",
    );
    expect(preset.name).toBe("モーニング");
    expect(preset.description).toBe("朝のルーティン");
    expect(preset.routineTemplates).toHaveLength(1);
    expect(preset.routineTemplates[0].title).toBe("朝食");
    expect(preset.routineTemplates[0]).not.toHaveProperty("daysOfWeek");
  });

  it("creates routines from preset and target days", () => {
    const preset = createPreset({
      routineTemplates: [
        { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
        { title: "運動", startTime: "07:30", duration: 20, category: "health" },
      ],
    });

    const routines = createRoutinesFromPreset(preset, [1, 2, 3]);
    expect(routines).toHaveLength(2);
    expect(routines[0].title).toBe("朝食");
    expect(routines[0].daysOfWeek).toEqual([1, 2, 3]);
    expect(routines[0].isCompleted).toBe(false);
    expect(routines[1].title).toBe("運動");
  });
});
