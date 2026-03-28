import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/preset/storage", () => ({
  getPresets: jest.fn(() => [
    {
      id: "p1",
      name: "朝ルーティン",
      description: "desc",
      routineTemplates: [],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    },
  ]),
}));

import { getPresets } from "@/features/preset/storage";
import { usePresetManagerPresetsState } from "../usePresetManagerPresetsState";

describe("usePresetManagerPresetsState", () => {
  it("initial presets list を保持する", () => {
    const { result } = renderHook(() => usePresetManagerPresetsState());

    expect(getPresets).toHaveBeenCalledTimes(1);
    expect(result.current.presets).toEqual(
      (getPresets as jest.Mock).mock.results[0].value,
    );

    act(() => {
      result.current.setPresets([]);
    });

    expect(result.current.presets).toEqual([]);
  });
});
