import * as settingsModule from "../index";

describe("settings index exports", () => {
  it("SettingsPage and storage functions are exported", () => {
    expect(settingsModule.SettingsPage).toBeDefined();
    expect(settingsModule.DEFAULT_SETTINGS).toBeDefined();
    expect(settingsModule.getSettings).toBeDefined();
    expect(settingsModule.saveSettings).toBeDefined();
    expect(settingsModule.SETTINGS_UPDATED_EVENT).toBeDefined();
  });
});
