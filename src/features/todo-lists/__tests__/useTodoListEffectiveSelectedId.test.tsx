import { renderHook } from "@testing-library/react";
import { useTodoListEffectiveSelectedId } from "../useTodoListEffectiveSelectedId";

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../selectors", () => ({
  resolveSelectedTodoListId: jest.fn(),
}));

jest.mock("../todoListEffectiveSelectedIdResult", () => ({
  createTodoListEffectiveSelectedIdResult: jest.fn(),
}));

import { createTodoListEffectiveSelectedIdResult } from "../todoListEffectiveSelectedIdResult";
import { resolveSelectedTodoListId } from "../selectors";
import { getTodoLists } from "../storage";

describe("useTodoListEffectiveSelectedId", () => {
  const list = {
    id: "list-1",
    title: "Inbox",
    items: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getTodoLists as jest.Mock).mockReturnValue([list]);
    (resolveSelectedTodoListId as jest.Mock).mockReturnValue("list-1");
    (createTodoListEffectiveSelectedIdResult as jest.Mock).mockReturnValue({
      effective: true,
    });
  });

  it("selectedId から effectiveSelectedId を解決して result helper に委譲する", () => {
    const { result } = renderHook(() =>
      useTodoListEffectiveSelectedId({ selectedId: "missing" }),
    );

    expect(resolveSelectedTodoListId).toHaveBeenCalledWith([list], "missing");
    expect(createTodoListEffectiveSelectedIdResult).toHaveBeenCalledWith({
      effectiveSelectedId: "list-1",
    });
    expect(result.current).toEqual({
      effective: true,
    });
  });
});
