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

  it("再レンダー前に toggleMoveCompletedToBottom を連続で呼んでも、2回目は1回目の反転結果をさらに反転させる（取りこぼさない）", () => {
    const onUpdateListMoveCompletedToBottom = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailItemOrder({
        list,
        onUpdateListMoveCompletedToBottom,
      }),
    );

    // 再レンダーを挟まず連続で2回呼ぶ（ダブルクリック・連打を想定）
    result.current.toggleMoveCompletedToBottom();
    result.current.toggleMoveCompletedToBottom();

    expect(onUpdateListMoveCompletedToBottom).toHaveBeenNthCalledWith(
      1,
      "list-1",
      true,
    );
    expect(onUpdateListMoveCompletedToBottom).toHaveBeenNthCalledWith(
      2,
      "list-1",
      false,
    );
  });

  it("再レンダー後は list の最新値を基準にトグルする", () => {
    const onUpdateListMoveCompletedToBottom = jest.fn();
    const { result, rerender } = renderHook(
      ({ list }) =>
        useTodoListDetailItemOrder({
          list,
          onUpdateListMoveCompletedToBottom,
        }),
      { initialProps: { list } },
    );

    result.current.toggleMoveCompletedToBottom();
    expect(onUpdateListMoveCompletedToBottom).toHaveBeenNthCalledWith(
      1,
      "list-1",
      true,
    );

    // 永続化ハンドラの結果を list に反映して再レンダー
    rerender({ list: { ...list, moveCompletedToBottom: true } });

    result.current.toggleMoveCompletedToBottom();
    expect(onUpdateListMoveCompletedToBottom).toHaveBeenNthCalledWith(
      2,
      "list-1",
      false,
    );
  });
});
