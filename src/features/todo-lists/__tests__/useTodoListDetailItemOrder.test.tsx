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

  it("一度もトグルを呼ばずに外部要因（リモート同期等）で list.moveCompletedToBottom が変わった直後でも、最新値を基準に正しく反転する", () => {
    const onUpdateListMoveCompletedToBottom = jest.fn();
    const { result, rerender } = renderHook(
      ({ list }) =>
        useTodoListDetailItemOrder({
          list,
          onUpdateListMoveCompletedToBottom,
        }),
      { initialProps: { list } },
    );

    // 自分でトグルを呼ばないまま、外部要因（別デバイスからの同期など）で
    // list.moveCompletedToBottom が true に変わったことを想定した再レンダー
    rerender({ list: { ...list, moveCompletedToBottom: true } });

    result.current.toggleMoveCompletedToBottom();

    // 画面に表示されている最新値(true)を正しく反転してfalseを送る
    expect(onUpdateListMoveCompletedToBottom).toHaveBeenCalledWith(
      "list-1",
      false,
    );
  });

  it("リストA でトグルした直後に別リスト(B)へ切り替わっても、Bの現在値を基準に正しく反転する（前リストの pending を引き継がない）", () => {
    const onUpdateListMoveCompletedToBottom = jest.fn();
    const listA: TodoList = {
      ...list,
      id: "list-a",
      moveCompletedToBottom: false,
    };
    const listB: TodoList = {
      ...list,
      id: "list-b",
      moveCompletedToBottom: false,
    };

    const { result, rerender } = renderHook(
      ({ list }) =>
        useTodoListDetailItemOrder({
          list,
          onUpdateListMoveCompletedToBottom,
        }),
      { initialProps: { list: listA } },
    );

    // リストAでトグル（pending は A の反転結果 true を保持したままになる）
    result.current.toggleMoveCompletedToBottom();
    expect(onUpdateListMoveCompletedToBottom).toHaveBeenNthCalledWith(
      1,
      "list-a",
      true,
    );

    // 再レンダーを挟まずリストBへ切り替え（実運用では key による再マウントで
    // 発生しないが、フック単体としての防御性を検証する）
    rerender({ list: listB });

    result.current.toggleMoveCompletedToBottom();

    // Aのpending(true)を引き継がず、Bの現在値(false)を正しく反転してtrueを送る
    expect(onUpdateListMoveCompletedToBottom).toHaveBeenNthCalledWith(
      2,
      "list-b",
      true,
    );
  });
});
