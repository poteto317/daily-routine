import { sortTodoListsByMenuOrder } from "../todoListManagementOrder";
import type { TodoList } from "../types";

const list = (id: string, overrides: Partial<TodoList> = {}): TodoList => ({
  id,
  title: id,
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("sortTodoListsByMenuOrder", () => {
  it("menuOrderが空のとき、元の配列順（作成順）がそのまま維持される", () => {
    const lists = [list("a"), list("b"), list("c")];

    const result = sortTodoListsByMenuOrder(lists, []);

    expect(result.map((l) => l.id)).toEqual(["a", "b", "c"]);
  });

  it("一部のリストがmenuOrderに明示エントリを持つとき、その順序が優先される", () => {
    const lists = [list("a"), list("b"), list("c")];
    const menuOrder = ["todo-list-c", "todo-list-a", "todo-list-b"];

    const result = sortTodoListsByMenuOrder(lists, menuOrder);

    expect(result.map((l) => l.id)).toEqual(["c", "a", "b"]);
  });

  it("menuOrderに旧来のtodo-listsプレースホルダーのみがあるとき、Todoリスト同士は自然順のまま", () => {
    const lists = [list("a"), list("b"), list("c")];
    const menuOrder = ["home", "todo-lists", "settings"];

    const result = sortTodoListsByMenuOrder(lists, menuOrder);

    expect(result.map((l) => l.id)).toEqual(["a", "b", "c"]);
  });

  it("非表示リストが混在していても、除外されず自然順に混在する", () => {
    const lists = [
      list("a"),
      list("hidden-1", { isHidden: true }),
      list("b"),
      list("hidden-2", { isHidden: true }),
    ];

    const result = sortTodoListsByMenuOrder(lists, []);

    expect(result.map((l) => l.id)).toEqual(["a", "hidden-1", "b", "hidden-2"]);
  });

  it("非表示リストにも明示的なmenuOrderエントリがあれば、それに従って並び替えられる", () => {
    const lists = [list("a"), list("hidden-1", { isHidden: true }), list("b")];
    const menuOrder = ["todo-list-hidden-1", "todo-list-b", "todo-list-a"];

    const result = sortTodoListsByMenuOrder(lists, menuOrder);

    expect(result.map((l) => l.id)).toEqual(["hidden-1", "b", "a"]);
  });

  it("menuOrderに存在しない新規リストは自然順の位置に現れる（一部だけ明示エントリがあるケース）", () => {
    const lists = [list("a"), list("b"), list("new")];
    // "new" はmenuOrderに存在しない（作成後まだ並び替えていない）
    const menuOrder = ["todo-list-b", "todo-list-a"];

    const result = sortTodoListsByMenuOrder(lists, menuOrder);

    // menuOrderに載っているb, aが先、menuOrderに無いnewは末尾（menuOrder.length + fallbackIndex）
    expect(result.map((l) => l.id)).toEqual(["b", "a", "new"]);
  });

  it("空配列を渡すと空配列を返す", () => {
    expect(sortTodoListsByMenuOrder([], [])).toEqual([]);
  });

  it("元の配列を変更しない（イミュータブル）", () => {
    const lists = [list("a"), list("b"), list("c")];
    const copy = [...lists];

    sortTodoListsByMenuOrder(lists, ["todo-list-c", "todo-list-a"]);

    expect(lists.map((l) => l.id)).toEqual(copy.map((l) => l.id));
  });
});
