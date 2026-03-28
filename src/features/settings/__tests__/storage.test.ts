import { DEFAULT_SETTINGS, getSettings, saveSettings } from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core", () => ({
  setStorageItem: jest.fn(),
  getUserScopedKey: jest.fn((key: string) => key),
}));

const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;

describe("settings storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("getSettingsは保存値とデフォルトをマージして返す", () => {
    localStorage.setItem(
      "app-settings",
      JSON.stringify({ theme: "dark", swipeAction: "edit" }),
    );

    const result = getSettings();

    expect(result.theme).toBe("dark");
    expect(result.swipeAction).toBe("edit");
    expect(result.defaultDurationMinutes).toBe(
      DEFAULT_SETTINGS.defaultDurationMinutes,
    );
  });

  it("getSettingsは不正データ時にDEFAULT_SETTINGSを返す", () => {
    localStorage.setItem("app-settings", "{invalid-json");

    const result = getSettings();

    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it("saveSettingsはsetStorageItemに保存する", () => {
    saveSettings(DEFAULT_SETTINGS);

    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "app-settings",
      DEFAULT_SETTINGS,
    );
  });
});
