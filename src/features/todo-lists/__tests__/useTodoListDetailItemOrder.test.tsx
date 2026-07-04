import { renderHook } from "@testing-library/react";
import type { TodoList } from "../types";
import { useTodoListDetailItemOrder } from "../useTodoListDetailItemOrder";

const list: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("useTodoListDetailItemOrder", () => {
  it("list.moveCompletedToBottom が未設定の場合は false を返す", () => {
    const { result } = renderHook(() =>
      useTodoListDetailItemOrder({
        list,
        onUpdateListMoveCompletedToBottom: jest.fn(),
      }),
    );

    expect(result.current.moveCompletedToBottom).toBe(false);
  });

  it("list.moveCompletedToBottom の値をそのまま返す", () => {
    const { result } = renderHook(() =>
      useTodoListDetailItemOrder({
        list: { ...list, moveCompletedToBottom: true },
        onUpdateListMoveCompletedToBottom: jest.fn(),
      }),
    );

    expect(result.current.moveCompletedToBottom).toBe(true);
  });

  it("toggleMoveCompletedToBottom は現在値を反転させて onUpdateListMoveCompletedToBottom を呼ぶ", () => {
    const onUpdateListMoveCompletedToBottom = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailItemOrder({
        list,
        onUpdateListMoveCompletedToBottom,
      }),
    );

    result.current.toggleMoveCompletedToBottom();

    expect(onUpdateListMoveCompletedToBottom).toHaveBeenCalledWith(
      "list-1",
      true,
    );
  });

  it("moveCompletedToBottom が true のとき toggle で false になる", () => {
    const onUpdateListMoveCompletedToBottom = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailItemOrder({
        list: { ...list, moveCompletedToBottom: true },
        onUpdateListMoveCompletedToBottom,
      }),
    );

    result.current.toggleMoveCompletedToBottom();

    expect(onUpdateListMoveCompletedToBottom).toHaveBeenCalledWith(
      "list-1",
      false,
    );
  });
});
