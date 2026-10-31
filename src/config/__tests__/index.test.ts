import { appConfig, menuConfig, uiTextConfig } from "../index";

describe("config exports", () => {
  it("appConfigが基本設定を持つ", () => {
    expect(appConfig).toBeDefined();
    expect(appConfig.app).toBeDefined();
    expect(appConfig.defaults).toBeDefined();
    expect(typeof appConfig.app.name).toBe("string");
  });

  it("menuConfigがメニュー定義を持つ", () => {
    expect(menuConfig).toBeDefined();
    expect(Array.isArray(menuConfig.menuItems)).toBe(true);
    expect(menuConfig.header).toBeDefined();
  });

  it("家計簿メニューにはベータバッジを設定しない", () => {
    expect(menuConfig.menuItems.find((item) => item.id === "budget")).not.toHaveProperty(
      "badge",
    );
  });

  it("uiTextConfigが主要文言定義を持つ", () => {
    expect(uiTextConfig).toBeDefined();
    expect(uiTextConfig.auth).toBeDefined();
    expect(uiTextConfig.settings).toBeDefined();
    expect(Array.isArray(uiTextConfig.days)).toBe(true);
  });
});
