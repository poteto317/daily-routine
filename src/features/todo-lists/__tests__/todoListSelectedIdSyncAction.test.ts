import { syncSelectedTodoListIdIfNeeded } from "../todoListSelectedIdSyncAction";

describe("syncSelectedTodoListIdIfNeeded", () => {
  it("effectiveSelectedId と selectedId が異なるとき setSelectedId を呼ぶ", () => {
    const setSelectedId = jest.fn();

    syncSelectedTodoListIdIfNeeded("list-1", "other", setSelectedId);

    expect(setSelectedId).toHaveBeenCalledWith("list-1");
    expect(setSelectedId).toHaveBeenCalledTimes(1);
  });

  it("異なるとき true を返す", () => {
    const result = syncSelectedTodoListIdIfNeeded("list-1", "other", jest.fn());

    expect(result).toBe(true);
  });

  it("effectiveSelectedId と selectedId が一致するとき setSelectedId を呼ばない", () => {
    const setSelectedId = jest.fn();

    syncSelectedTodoListIdIfNeeded("list-1", "list-1", setSelectedId);

    expect(setSelectedId).not.toHaveBeenCalled();
  });

  it("一致するとき false を返す", () => {
    const result = syncSelectedTodoListIdIfNeeded(
      "list-1",
      "list-1",
      jest.fn(),
    );

    expect(result).toBe(false);
  });

  it("effectiveSelectedId が null のとき null を setSelectedId に渡す", () => {
    const setSelectedId = jest.fn();

    syncSelectedTodoListIdIfNeeded(null, "list-1", setSelectedId);

    expect(setSelectedId).toHaveBeenCalledWith(null);
  });

  it("どちらも null のとき false を返す（同期不要）", () => {
    const setSelectedId = jest.fn();

    const result = syncSelectedTodoListIdIfNeeded(null, null, setSelectedId);

    expect(result).toBe(false);
    expect(setSelectedId).not.toHaveBeenCalled();
  });

  it("selectedId が null で effectiveSelectedId が文字列のとき true を返す", () => {
    const result = syncSelectedTodoListIdIfNeeded("list-1", null, jest.fn());

    expect(result).toBe(true);
  });
});
