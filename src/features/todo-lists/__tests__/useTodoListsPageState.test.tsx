import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListSelectionState", () => ({
  useTodoListSelectionState: jest.fn(),
}));

jest.mock("../useTodoListDetailClipboard", () => ({
  useTodoListDetailClipboard: jest.fn(),
}));

import { useTodoListSelectionState } from "../useTodoListSelectionState";
import { useTodoListDetailClipboard } from "../useTodoListDetailClipboard";
import { useTodoListsPageState } from "../useTodoListsPageState";

describe("useTodoListsPageState", () => {
  const setClipboard = jest.fn();
  const clearClipboard = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListSelectionState as jest.Mock).mockReturnValue({
      effectiveSelectedId: "list-1",
    });
    (useTodoListDetailClipboard as jest.Mock).mockReturnValue({
      clipboardItems: [],
      setClipboard,
      clearClipboard,
    });
  });

  it("useTodoListSelectionState と useTodoListDetailClipboard を呼ぶ", () => {
    renderHook(() => useTodoListsPageState());

    expect(useTodoListSelectionState).toHaveBeenCalledTimes(1);
    expect(useTodoListDetailClipboard).toHaveBeenCalledTimes(1);
  });

  it("effectiveSelectedId を返す", () => {
    const { result } = renderHook(() => useTodoListsPageState());

    expect(result.current.effectiveSelectedId).toBe("list-1");
  });

  it("clipboardItems・setClipboard・clearClipboard を返す", () => {
    const item = {
      id: "i-1",
      title: "T",
      isCompleted: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    (useTodoListDetailClipboard as jest.Mock).mockReturnValue({
      clipboardItems: [item],
      setClipboard,
      clearClipboard,
    });

    const { result } = renderHook(() => useTodoListsPageState());

    expect(result.current.clipboardItems).toEqual([item]);
    expect(result.current.setClipboard).toBe(setClipboard);
    expect(result.current.clearClipboard).toBe(clearClipboard);
  });

  it("effectiveSelectedId が null のとき null を返す", () => {
    (useTodoListSelectionState as jest.Mock).mockReturnValue({
      effectiveSelectedId: null,
    });

    const { result } = renderHook(() => useTodoListsPageState());

    expect(result.current.effectiveSelectedId).toBeNull();
  });
});
