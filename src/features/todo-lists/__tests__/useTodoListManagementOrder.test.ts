import { renderHook } from "@testing-library/react";

jest.mock("@/features/settings", () => ({
  getSettings: jest.fn(),
}));

import { getSettings } from "@/features/settings";
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("menuOrderが未設定のとき、元の配列順を保つ", () => {
    (getSettings as jest.Mock).mockReturnValue({});
    const lists = [list("a"), list("b"), list("c")];

    const { result } = renderHook(() => useTodoListManagementOrder({ lists }));

    expect(result.current.map((l) => l.id)).toEqual(["a", "b", "c"]);
  });

  it("menuOrderが設定されているとき、その順序で並び替える", () => {
    (getSettings as jest.Mock).mockReturnValue({
      menuOrder: ["todo-list-c", "todo-list-a", "todo-list-b"],
    });
    const lists = [list("a"), list("b"), list("c")];

    const { result } = renderHook(() => useTodoListManagementOrder({ lists }));

    expect(result.current.map((l) => l.id)).toEqual(["c", "a", "b"]);
  });

  it("listsが変わると並び替え結果も再計算される", () => {
    (getSettings as jest.Mock).mockReturnValue({
      menuOrder: ["todo-list-b", "todo-list-a"],
    });

    const { result, rerender } = renderHook(
      ({ lists }) => useTodoListManagementOrder({ lists }),
      { initialProps: { lists: [list("a"), list("b")] } },
    );

    expect(result.current.map((l) => l.id)).toEqual(["b", "a"]);

    rerender({ lists: [list("a"), list("b"), list("c")] });

    expect(result.current.map((l) => l.id)).toEqual(["b", "a", "c"]);
  });

  it("同じlists参照で再レンダーしても並び替え結果の参照が安定している（useMemo）", () => {
    (getSettings as jest.Mock).mockReturnValue({});
    const lists = [list("a"), list("b")];

    const { result, rerender } = renderHook(() =>
      useTodoListManagementOrder({ lists }),
    );
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });
});
