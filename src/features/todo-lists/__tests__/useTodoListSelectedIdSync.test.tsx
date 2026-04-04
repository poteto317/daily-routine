import { renderHook } from "@testing-library/react";
import { useTodoListSelectedIdSync } from "../useTodoListSelectedIdSync";

jest.mock("../todoListSelectedIdSyncAction", () => ({
  syncSelectedTodoListIdIfNeeded: jest.fn(),
}));

jest.mock("../selectedTodoList", () => ({
  getSelectedTodoListId: jest.fn(),
  setSelectedTodoListId: jest.fn(),
  subscribeSelectedTodoListId: jest.fn(),
}));

import { syncSelectedTodoListIdIfNeeded } from "../todoListSelectedIdSyncAction";
import { setSelectedTodoListId } from "../selectedTodoList";

describe("useTodoListSelectedIdSync", () => {
  it("effective と selected が異なる場合に同期 action を呼ぶ", () => {
    renderHook(() =>
      useTodoListSelectedIdSync({
        effectiveSelectedId: "list-1",
        selectedId: "missing",
      }),
    );

    expect(syncSelectedTodoListIdIfNeeded).toHaveBeenCalledWith(
      "list-1",
      "missing",
      setSelectedTodoListId,
    );
  });
});
