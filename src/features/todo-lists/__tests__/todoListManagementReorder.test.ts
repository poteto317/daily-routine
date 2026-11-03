import { orderHeaderMenuItems } from "@/hooks/headerMenuOrder";
import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";
import {
  STATICS_AFTER_LISTS,
  STATICS_BEFORE_LISTS,
} from "@/hooks/__fixtures__/menuOrderNaturalIds";
import { sortTodoListsByMenuOrder } from "../todoListManagementOrder";
import { reorderTodoListsInMenuOrder } from "../todoListManagementReorder";
import type { TodoList } from "../types";

const list = (id: string, overrides: Partial<TodoList> = {}): TodoList => ({
  id,
  title: id,
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const menuId = (listId: string) => `todo-list-${listId}`;

const STATIC_HEADER_ITEMS: HeaderMenuItem[] = [
  { id: "home", label: "ホーム", icon: "🏠", route: "home" },
  { id: "journal", label: "ジャーナル", icon: "📔", route: "journal" },
  { id: "budget", label: "家計簿", icon: "💰", route: "budget" },
  {
    id: "todo-list-management",
    label: "Todoリスト管理",
    icon: "📝",
    route: "todo-list-management",
  },
  { id: "bug-report", label: "不具合を報告", icon: "📣", route: "bug-report" },
  { id: "settings", label: "設定", icon: "⚙️", route: "settings" },
];

/** 管理画面の表示順（リストの ID）。 */
const displayedIds = (lists: TodoList[], menuOrder: string[]) =>
  sortTodoListsByMenuOrder(lists, menuOrder).map((item) => item.id);

/** ハンバーガーメニューの並び（表示中のリストだけを動的な項目として渡す）。 */
const headerIds = (lists: TodoList[], menuOrder: string[]) =>
  orderHeaderMenuItems({
    staticItems: STATIC_HEADER_ITEMS,
    dynamicItems: lists
      .filter((item) => !item.isHidden)
      .map((item) => ({
        id: menuId(item.id),
        label: item.title,
        icon: "✅",
        route: "todo-lists" as const,
      })),
    menuOrder,
  }).map((item) => item.id);

const withoutLists = (ids: string[]) =>
  ids.filter(
    (id) => !id.startsWith("todo-list-") || id === "todo-list-management",
  );

/** 自然順の固定でない項目のうち menuOrder に載っていないもの（結果の末尾に自然順で足される）。 */
const staticsNotIn = (menuOrder: string[]) =>
  [...STATICS_BEFORE_LISTS, ...STATICS_AFTER_LISTS].filter(
    (id) => !menuOrder.includes(id),
  );

describe("reorderTodoListsInMenuOrder", () => {
  it("menuOrder が空: 末尾のリストを先頭へ移すと、リストの枠だけが入れ替わり他のメニュー項目の順は変わらない", () => {
    const lists = [list("a"), list("b"), list("c")];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: [],
      activeListId: "c",
      overListId: "a",
    });

    expect(result).toEqual([
      ...STATICS_BEFORE_LISTS,
      menuId("c"),
      menuId("a"),
      menuId("b"),
      ...STATICS_AFTER_LISTS,
    ]);
    expect(displayedIds(lists, result ?? [])).toEqual(["c", "a", "b"]);
    expect(withoutLists(headerIds(lists, result ?? []))).toEqual(
      withoutLists(headerIds(lists, [])),
    );
    expect(headerIds(lists, result ?? [])).toEqual([
      "home",
      "journal",
      "budget",
      menuId("c"),
      menuId("a"),
      menuId("b"),
      "todo-list-management",
      "bug-report",
      "settings",
    ]);
  });

  it("menuOrder が空: 先頭のリストを末尾へ移せる", () => {
    const lists = [list("a"), list("b"), list("c")];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: [],
      activeListId: "a",
      overListId: "c",
    });

    expect(displayedIds(lists, result ?? [])).toEqual(["b", "c", "a"]);
  });

  it("設定画面で保存済み（全リストが載っている）: リストの枠だけが入れ替わり、他の要素は同じ位置に残る", () => {
    const lists = [list("a"), list("b"), list("c")];
    const menuOrder = [
      "budget",
      menuId("b"),
      "journal",
      menuId("a"),
      menuId("c"),
      "bug-report",
    ];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId: "a",
      overListId: "b",
    });

    expect(result).toEqual([
      "budget",
      menuId("a"),
      "journal",
      menuId("b"),
      menuId("c"),
      "bug-report",
      ...staticsNotIn(menuOrder),
    ]);
    expect(displayedIds(lists, result ?? [])).toEqual(["a", "b", "c"]);
    expect(withoutLists(headerIds(lists, result ?? []))).toEqual(
      withoutLists(headerIds(lists, menuOrder)),
    );
  });

  it("一部のリストだけが載っている: 載っていない新しいリストも並べ替えられる", () => {
    const lists = [list("a"), list("b"), list("new")];
    const menuOrder = [menuId("b"), menuId("a")];

    expect(displayedIds(lists, menuOrder)).toEqual(["b", "a", "new"]);

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId: "new",
      overListId: "b",
    });

    expect(result).toEqual([
      menuId("new"),
      menuId("b"),
      menuId("a"),
      ...STATICS_BEFORE_LISTS,
      ...STATICS_AFTER_LISTS,
    ]);
    expect(displayedIds(lists, result ?? [])).toEqual(["new", "b", "a"]);
    expect(withoutLists(headerIds(lists, result ?? []))).toEqual(
      withoutLists(headerIds(lists, menuOrder)),
    );
  });

  it("旧来の todo-lists だけが載っている: 未知の ID は同じ相対位置に残り、todo-lists は結果から外れる", () => {
    const lists = [list("a"), list("b"), list("c")];
    const menuOrder = ["journal", "todo-lists", "budget", "future-feature"];

    expect(displayedIds(lists, menuOrder)).toEqual(["a", "b", "c"]);

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId: "a",
      overListId: "c",
    });

    expect(result).toEqual([
      "journal",
      menuId("b"),
      menuId("c"),
      menuId("a"),
      "budget",
      "future-feature",
      ...staticsNotIn(menuOrder),
    ]);
    expect(displayedIds(lists, result ?? [])).toEqual(["b", "c", "a"]);
    expect(withoutLists(headerIds(lists, result ?? []))).toEqual(
      withoutLists(headerIds(lists, menuOrder)),
    );
  });

  it("旧来の todo-lists がある menuOrder を並べ替えた後に作ったリストは、並べたリストの最後の直後に出る", () => {
    const lists = [list("a"), list("b"), list("c")];
    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: ["journal", "todo-lists", "budget", "future-feature"],
      activeListId: "a",
      overListId: "c",
    });
    const listsWithNew = [...lists, list("x")];

    expect(displayedIds(listsWithNew, result ?? [])).toEqual([
      "b",
      "c",
      "a",
      "x",
    ]);
    expect(headerIds(listsWithNew, result ?? [])).toEqual([
      "home",
      "journal",
      menuId("b"),
      menuId("c"),
      menuId("a"),
      menuId("x"),
      "budget",
      "todo-list-management",
      "bug-report",
      "settings",
    ]);
  });

  it("非表示のリストが途中にあっても、結果から消えずに計算される（L-460）", () => {
    const lists = [list("a"), list("h", { isHidden: true }), list("b")];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: [],
      activeListId: "b",
      overListId: "a",
    });

    expect(result).toEqual([
      ...STATICS_BEFORE_LISTS,
      menuId("b"),
      menuId("a"),
      menuId("h"),
      ...STATICS_AFTER_LISTS,
    ]);
    expect(displayedIds(lists, result ?? [])).toEqual(["b", "a", "h"]);
    expect(headerIds(lists, result ?? [])).toEqual([
      "home",
      "journal",
      "budget",
      menuId("b"),
      menuId("a"),
      "todo-list-management",
      "bug-report",
      "settings",
    ]);
  });

  it("非表示のリスト自体も移動できる", () => {
    const lists = [list("a"), list("h", { isHidden: true }), list("b")];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: [],
      activeListId: "h",
      overListId: "a",
    });

    expect(displayedIds(lists, result ?? [])).toEqual(["h", "a", "b"]);
  });

  it.each([
    ["移動元が lists に無い", "zzz", "a"],
    ["移動先が lists に無い", "a", "zzz"],
    ["移動元と移動先が同じ", "b", "b"],
  ])("%s ときは null を返す", (_label, activeListId, overListId) => {
    expect(
      reorderTodoListsInMenuOrder({
        lists: [list("a"), list("b")],
        menuOrder: [],
        activeListId,
        overListId,
      }),
    ).toBeNull();
  });

  it("入力の lists と menuOrder を変更しない", () => {
    const lists = [list("a"), list("b"), list("c")];
    const menuOrder = [menuId("c"), "journal", menuId("a")];
    const listsCopy = [...lists];
    const menuOrderCopy = [...menuOrder];

    reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId: "a",
      overListId: "c",
    });

    expect(lists).toEqual(listsCopy);
    expect(menuOrder).toEqual(menuOrderCopy);
  });
});
