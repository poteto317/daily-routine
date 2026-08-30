import type { RoutinePreset } from "@/types/routine";
import { findPresetById } from "../presetLookup";

const presets: RoutinePreset[] = [
  {
    id: "preset-1",
    name: "朝ルーティン",
    routineTemplates: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
];

describe("findPresetById", () => {
  it("一致するプリセットを返す", () => {
    expect(findPresetById(presets, "preset-1")).toBe(presets[0]);
  });

  it.each([null, "missing"])("対象 %s がなければundefinedを返す", (id) => {
    expect(findPresetById(presets, id)).toBeUndefined();
  });
});
