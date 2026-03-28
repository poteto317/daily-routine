import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListSelectedIdValue", () => ({
  useTodoListSelectedIdValue: jest.fn(),
}));

jest.mock("../useTodoListSelectedIdSync", () => ({
  useTodoListSelectedIdSync: jest.fn(),
}));

jest.mock("../todoListSelectionStateResult", () => ({
  createTodoListSelectionStateResult: jest.fn(),
}));

import { createTodoListSelectionStateResult } from "../todoListSelectionStateResult";
import { useTodoListSelectedIdSync } from "../useTodoListSelectedIdSync";
import { useTodoListSelectedIdValue } from "../useTodoListSelectedIdValue";
import { useTodoListSelectionState } from "../useTodoListSelectionState";

describe("useTodoListSelectionState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListSelectedIdValue as jest.Mock).mockReturnValue({
      effectiveSelectedId: "list-1",
      selectedId: "missing",
    });
    (createTodoListSelectionStateResult as jest.Mock).mockReturnValue({
      selectionState: true,
    });
  });

  it("selected id value hook と sync hook を compose して result helper に委譲する", () => {
    const { result } = renderHook(() => useTodoListSelectionState());

    expect(useTodoListSelectedIdValue).toHaveBeenCalledTimes(1);
    expect(useTodoListSelectedIdSync).toHaveBeenCalledWith({
      effectiveSelectedId: "list-1",
      selectedId: "missing",
    });
    expect(createTodoListSelectionStateResult).toHaveBeenCalledWith({
      effectiveSelectedId: "list-1",
    });
    expect(result.current).toEqual({
      selectionState: true,
    });
  });
});
