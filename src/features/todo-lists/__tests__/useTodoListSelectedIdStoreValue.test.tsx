import { renderHook } from "@testing-library/react";
import { useTodoListSelectedIdStoreValue } from "../useTodoListSelectedIdStoreValue";

jest.mock("../selectedTodoList", () => ({
  getSelectedTodoListId: jest.fn(),
  setSelectedTodoListId: jest.fn(),
  subscribeSelectedTodoListId: jest.fn(() => () => undefined),
}));

jest.mock("../todoListSelectedIdStoreValueResult", () => ({
  createTodoListSelectedIdStoreValueResult: jest.fn(),
}));

import { createTodoListSelectedIdStoreValueResult } from "../todoListSelectedIdStoreValueResult";
import {
  getSelectedTodoListId,
  subscribeSelectedTodoListId,
} from "../selectedTodoList";

describe("useTodoListSelectedIdStoreValue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSelectedTodoListId as jest.Mock).mockReturnValue("list-1");
    (createTodoListSelectedIdStoreValueResult as jest.Mock).mockReturnValue({
      storeValue: true,
    });
  });

  it("external store から selectedId を購読して result helper に委譲する", () => {
    const { result } = renderHook(() => useTodoListSelectedIdStoreValue());

    expect(subscribeSelectedTodoListId).toHaveBeenCalled();
    expect(createTodoListSelectedIdStoreValueResult).toHaveBeenCalledWith({
      selectedId: "list-1",
    });
    expect(result.current).toEqual({
      storeValue: true,
    });
  });
});
