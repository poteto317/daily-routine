import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/settings", () => ({
  getSettings: jest.fn(),
  saveMenuOrder: jest.fn(),
}));

import { getSettings, saveMenuOrder } from "@/features/settings";
import {
  STATICS_AFTER_LISTS,
  STATICS_BEFORE_LISTS,
} from "@/hooks/__fixtures__/menuOrderNaturalIds";
import type { TodoList } from "../types";
import { useTodoListManagementMenuOrder } from "../useTodoListManagementMenuOrder";

const mockGetSettings = getSettings as jest.Mock;
const mockSaveMenuOrder = saveMenuOrder as jest.Mock;

const list = (id: string): TodoList => ({
  id,
  title: id,
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const lists = [list("a"), list("b"), list("c")];

describe("useTodoListManagementMenuOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue({});
  });

  it("初期の menuOrder を getSettings から読む", () => {
    mockGetSettings.mockReturnValue({ menuOrder: ["journal", "budget"] });

    const { result } = renderHook(() =>
      useTodoListManagementMenuOrder({ lists }),
    );

    expect(result.current.menuOrder).toEqual(["journal", "budget"]);
  });

  it("menuOrder が未設定なら空の配列にする", () => {
    const { result } = renderHook(() =>
      useTodoListManagementMenuOrder({ lists }),
    );

    expect(result.current.menuOrder).toEqual([]);
  });

  it("成り立つ移動では、新しい menuOrder を 1 回保存し、state も同じ配列にする", () => {
    const { result } = renderHook(() =>
      useTodoListManagementMenuOrder({ lists }),
    );

    act(() => {
      result.current.handleReorderLists("c", "a");
    });

    const expected = [
      ...STATICS_BEFORE_LISTS,
      "todo-list-c",
      "todo-list-a",
      "todo-list-b",
      ...STATICS_AFTER_LISTS,
    ];
    expect(mockSaveMenuOrder).toHaveBeenCalledTimes(1);
    expect(mockSaveMenuOrder).toHaveBeenCalledWith(expected);
    expect(result.current.menuOrder).toEqual(expected);
    expect(result.current.menuOrder).toBe(mockSaveMenuOrder.mock.calls[0][0]);
  });

  it.each([
    ["同じ ID", "a", "a"],
    ["lists に無い ID", "zzz", "a"],
  ])(
    "成り立たない移動（%s）では保存せず、menuOrder も変えない",
    (_label, activeListId, overListId) => {
      const { result } = renderHook(() =>
        useTodoListManagementMenuOrder({ lists }),
      );
      const before = result.current.menuOrder;

      act(() => {
        result.current.handleReorderLists(activeListId, overListId);
      });

      expect(mockSaveMenuOrder).not.toHaveBeenCalled();
      expect(result.current.menuOrder).toBe(before);
    },
  );

  it("続けて並べ替えると、2 回目は 1 回目の結果を基準にする", () => {
    const { result } = renderHook(() =>
      useTodoListManagementMenuOrder({ lists }),
    );

    act(() => {
      result.current.handleReorderLists("c", "a");
    });
    act(() => {
      result.current.handleReorderLists("b", "c");
    });

    expect(mockSaveMenuOrder).toHaveBeenCalledTimes(2);
    expect(mockSaveMenuOrder).toHaveBeenLastCalledWith([
      ...STATICS_BEFORE_LISTS,
      "todo-list-b",
      "todo-list-c",
      "todo-list-a",
      ...STATICS_AFTER_LISTS,
    ]);
  });
});
