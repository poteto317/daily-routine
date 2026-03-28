import { renderHook } from "@testing-library/react";
import { useTodoListSelectedIdValue } from "../useTodoListSelectedIdValue";

jest.mock("../useTodoListSelectedIdStoreValue", () => ({
  useTodoListSelectedIdStoreValue: jest.fn(),
}));

jest.mock("../useTodoListEffectiveSelectedId", () => ({
  useTodoListEffectiveSelectedId: jest.fn(),
}));

jest.mock("../todoListSelectedIdValueResult", () => ({
  createTodoListSelectedIdValueResult: jest.fn(),
}));

import { createTodoListSelectedIdValueResult } from "../todoListSelectedIdValueResult";
import { useTodoListEffectiveSelectedId } from "../useTodoListEffectiveSelectedId";
import { useTodoListSelectedIdStoreValue } from "../useTodoListSelectedIdStoreValue";

describe("useTodoListSelectedIdValue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListSelectedIdStoreValue as jest.Mock).mockReturnValue({
      selectedId: "missing",
    });
    (useTodoListEffectiveSelectedId as jest.Mock).mockReturnValue({
      effectiveSelectedId: "list-1",
    });
    (createTodoListSelectedIdValueResult as jest.Mock).mockReturnValue({
      selectedIdValue: true,
    });
  });

  it("store value hook と effective id hook を compose して result helper に委譲する", () => {
    const { result } = renderHook(() => useTodoListSelectedIdValue());

    expect(useTodoListSelectedIdStoreValue).toHaveBeenCalledTimes(1);
    expect(useTodoListEffectiveSelectedId).toHaveBeenCalledWith({
      selectedId: "missing",
    });
    expect(createTodoListSelectedIdValueResult).toHaveBeenCalledWith({
      effectiveSelectedId: "list-1",
      selectedId: "missing",
    });
    expect(result.current).toEqual({ selectedIdValue: true });
  });
});
