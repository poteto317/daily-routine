import { buildMenuOrderNaturalIds } from "@/hooks/headerMenuOrder";
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

  it("home・settings・account-admin と旧来の todo-lists を含まない", () => {
    const ids = buildMenuOrderNaturalIds(["todo-list-a"]);

    expect(ids).not.toContain("home");
    expect(ids).not.toContain("settings");
    expect(ids).not.toContain("account-admin");
    expect(ids).not.toContain("todo-lists");
  });
});
