import { act, renderHook } from "@testing-library/react";
import { createSettingsObjectStateResult } from "../state/settingsObjectStateResult";
import { useSettingsObjectState } from "../state/useSettingsObjectState";

jest.mock("../state/settingsObjectStateResult", () => ({
  createSettingsObjectStateResult: jest.fn(),
}));

describe("useSettingsObjectState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createSettingsObjectStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("settings object を保持する", () => {
    const { result } = renderHook(() =>
      useSettingsObjectState({
        settings: {
          defaultDurationMinutes: 30,
          defaultNotificationMinutes: 0,
          theme: "auto",
          swipeAction: "delete",
          pomodoroFocusMinutes: 25,
          pomodoroBreakMinutes: 5,
          menuOrder: [],
        },
      }),
    );

    expect(createSettingsObjectStateResult).toHaveBeenCalledWith({
      settings: expect.objectContaining({ theme: "auto" }),
      setSettings: expect.any(Function),
    });

    act(() => {
      result.current.setSettings((prev) => ({ ...prev, theme: "dark" }));
    });

    expect(result.current.settings.theme).toBe("dark");
    expect(createSettingsObjectStateResult).toHaveBeenLastCalledWith({
      settings: expect.objectContaining({ theme: "dark" }),
      setSettings: expect.any(Function),
    });
  });
});
