import {
  DEFAULT_SETTINGS,
  getSettings,
  saveMenuOrder,
  saveSettings,
  SETTINGS_UPDATED_EVENT,
} from "../storage";
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

describe("saveMenuOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("保存済みの他の設定を保ったまま menuOrder だけを置き換える", () => {
    localStorage.setItem(
      "app-settings",
      JSON.stringify({ theme: "dark", menuOrder: ["journal", "budget"] }),
    );

    saveMenuOrder(["budget", "journal"]);

    expect(mockSetStorageItem).toHaveBeenCalledTimes(1);
    expect(mockSetStorageItem).toHaveBeenCalledWith("app-settings", {
      ...DEFAULT_SETTINGS,
      theme: "dark",
      menuOrder: ["budget", "journal"],
    });
  });

  it("保存すると SETTINGS_UPDATED_EVENT を発火する", () => {
    const listener = jest.fn();
    window.addEventListener(SETTINGS_UPDATED_EVENT, listener);

    saveMenuOrder(["journal"]);

    window.removeEventListener(SETTINGS_UPDATED_EVENT, listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
