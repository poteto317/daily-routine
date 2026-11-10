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
    const budgetItem = menuConfig.menuItems.find(
      (item) => item.id === "budget",
    );
    expect(budgetItem).toBeDefined();
    expect(budgetItem).not.toHaveProperty("badge");
  });

  it("ジャーナルメニューにはベータバッジを設定しない", () => {
    const journalItem = menuConfig.menuItems.find(
      (item) => item.id === "journal",
    );
    expect(journalItem).toBeDefined();
    expect(journalItem).not.toHaveProperty("badge");
  });

  it("業務日誌メニューはジャーナルの直後にあり、🗒️ のアイコンでバッジを持たない", () => {
    const ids = menuConfig.menuItems.map((item) => item.id);
    const item = menuConfig.menuItems.find((i) => i.id === "weekly-log");

    expect(ids.indexOf("weekly-log")).toBe(ids.indexOf("journal") + 1);
    expect(item).toEqual({
      id: "weekly-log",
      label: "業務日誌",
      icon: "🗒️",
      route: "weekly-log",
    });
  });

  it("不具合報告メニューのアイコンに📣を設定する", () => {
    const item = menuConfig.menuItems.find((i) => i.id === "bug-report");
    expect(item).toBeDefined();
    expect(item?.icon).toBe("📣");
  });

  it("uiTextConfigが主要文言定義を持つ", () => {
    expect(uiTextConfig).toBeDefined();
    expect(uiTextConfig.auth).toBeDefined();
    expect(uiTextConfig.settings).toBeDefined();
    expect(Array.isArray(uiTextConfig.days)).toBe(true);
  });
});
