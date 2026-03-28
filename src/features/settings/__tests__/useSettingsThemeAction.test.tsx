import { act, renderHook } from "@testing-library/react";

jest.mock("../state/theme", () => ({
  applyTheme: jest.fn(),
}));

import { applyTheme } from "../state/theme";
import { useSettingsThemeAction } from "../state/useSettingsThemeAction";

describe("useSettingsThemeAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("theme 更新と applyTheme を実行する", () => {
    const setSettings = jest.fn();
    const { result } = renderHook(() =>
      useSettingsThemeAction({
        setSettings,
      }),
    );

    act(() => {
      result.current("dark");
    });

    expect(setSettings).toHaveBeenCalledWith(expect.any(Function));
    const updater = (setSettings as jest.Mock).mock.calls[0][0] as (
      value: Record<string, unknown>,
    ) => Record<string, unknown>;
    expect(updater({ theme: "auto", defaultDurationMinutes: 30 })).toEqual({
      theme: "dark",
      defaultDurationMinutes: 30,
    });
    expect(applyTheme).toHaveBeenCalledWith("dark");
  });
});
