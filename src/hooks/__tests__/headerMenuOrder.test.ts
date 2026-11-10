import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";
import {
  buildMenuOrderNaturalIds,
  orderHeaderMenuItems,
} from "@/hooks/headerMenuOrder";
import {
  STATICS_AFTER_LISTS,
  STATICS_BEFORE_LISTS,
} from "@/hooks/__fixtures__/menuOrderNaturalIds";

describe("buildMenuOrderNaturalIds", () => {
  it("固定の項目を除いた menuConfig の順に並べ、todo-lists の位置に渡したリストの ID をその順で入れる", () => {
    expect(buildMenuOrderNaturalIds(["todo-list-b", "todo-list-a"])).toEqual([
      ...STATICS_BEFORE_LISTS,
      "todo-list-b",
      "todo-list-a",
      ...STATICS_AFTER_LISTS,
    ]);
  });

  it("リストが 0 件ならリストの ID を含まない", () => {
    expect(buildMenuOrderNaturalIds([])).toEqual([
      ...STATICS_BEFORE_LISTS,
      ...STATICS_AFTER_LISTS,
    ]);
  });

  it("既定の並びでは weekly-log がジャーナルの直後に来る", () => {
    const ids = buildMenuOrderNaturalIds([]);

    expect(ids.indexOf("weekly-log")).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf("weekly-log")).toBe(ids.indexOf("journal") + 1);
  });

  it("home・settings・account-admin と旧来の todo-lists を含まない", () => {
    const ids = buildMenuOrderNaturalIds(["todo-list-a"]);

    expect(ids).not.toContain("home");
    expect(ids).not.toContain("settings");
    expect(ids).not.toContain("account-admin");
    expect(ids).not.toContain("todo-lists");
  });
});

describe("orderHeaderMenuItems（保存済みの並びに weekly-log が無い利用者）", () => {
  const toItem = (id: string) =>
    ({ id, label: id, icon: "", route: "home" }) as HeaderMenuItem;

  it("weekly-log は保存済みの全項目の後ろ、保存順に載っていない他の項目（同期履歴管理）の手前に並び、設定は末尾に固定される", () => {
    const staticItems = [
      "home",
      "journal",
      "weekly-log",
      "bug-report",
      "sync-management",
      "settings",
    ].map(toItem);

    const result = orderHeaderMenuItems({
      staticItems,
      dynamicItems: [],
      menuOrder: ["bug-report", "journal"],
    });

    expect(result.map((item) => item.id)).toEqual([
      "home",
      "bug-report",
      "journal",
      "weekly-log",
      "sync-management",
      "settings",
    ]);
  });
});
