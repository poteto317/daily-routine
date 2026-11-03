import { renderHook } from "@testing-library/react";
import type { TodoList } from "../types";
import { useTodoListManagementOrder } from "../useTodoListManagementOrder";

const list = (id: string, overrides: Partial<TodoList> = {}): TodoList => ({
  id,
  title: id,
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("useTodoListManagementOrder", () => {
  it("menuOrder が空のとき、元の配列順を保つ", () => {
    const lists = [list("a"), list("b"), list("c")];

    const { result } = renderHook(() =>
      useTodoListManagementOrder({ lists, menuOrder: [] }),
    );

    expect(result.current.map((l) => l.id)).toEqual(["a", "b", "c"]);
  });

  it("引数の menuOrder の順序で並び替える", () => {
    const lists = [list("a"), list("b"), list("c")];

    const { result } = renderHook(() =>
      useTodoListManagementOrder({
        lists,
        menuOrder: ["todo-list-c", "todo-list-a", "todo-list-b"],
      }),
    );

    expect(result.current.map((l) => l.id)).toEqual(["c", "a", "b"]);
  });

  it("lists が変わると並び替え結果も再計算される", () => {
    const menuOrder = ["todo-list-b", "todo-list-a"];
    const { result, rerender } = renderHook(
      ({ lists }) => useTodoListManagementOrder({ lists, menuOrder }),
      { initialProps: { lists: [list("a"), list("b")] } },
    );

    expect(result.current.map((l) => l.id)).toEqual(["b", "a"]);

    rerender({ lists: [list("a"), list("b"), list("c")] });

    expect(result.current.map((l) => l.id)).toEqual(["b", "a", "c"]);
  });

  it("menuOrder だけが変わっても並び替え結果が再計算される", () => {
    const lists = [list("a"), list("b")];
    const { result, rerender } = renderHook(
      ({ menuOrder }) => useTodoListManagementOrder({ lists, menuOrder }),
      { initialProps: { menuOrder: [] as string[] } },
    );

    expect(result.current.map((l) => l.id)).toEqual(["a", "b"]);

    rerender({ menuOrder: ["todo-list-b", "todo-list-a"] });

    expect(result.current.map((l) => l.id)).toEqual(["b", "a"]);
  });

  it("同じ lists と menuOrder の参照で再レンダーしても結果の参照が安定している（useMemo）", () => {
    const lists = [list("a"), list("b")];
    const menuOrder = ["todo-list-b"];

    const { result, rerender } = renderHook(() =>
      useTodoListManagementOrder({ lists, menuOrder }),
    );
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });
});
