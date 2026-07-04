import { renderHook } from "@testing-library/react";
import type { TodoList } from "../types";
import { useTodoListDetailHideCompleted } from "../useTodoListDetailHideCompleted";

const list: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("useTodoListDetailHideCompleted", () => {
  it("list.hideCompleted が未設定の場合は false を返す", () => {
    const { result } = renderHook(() =>
      useTodoListDetailHideCompleted({
        list,
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    expect(result.current.hideCompleted).toBe(false);
  });

  it("list.hideCompleted の値をそのまま返す", () => {
    const { result } = renderHook(() =>
      useTodoListDetailHideCompleted({
        list: { ...list, hideCompleted: true },
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    expect(result.current.hideCompleted).toBe(true);
  });

  it("toggleHideCompleted は現在値(false)を反転させて onUpdateListHideCompleted を呼ぶ", () => {
    const onUpdateListHideCompleted = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailHideCompleted({
        list,
        onUpdateListHideCompleted,
      }),
    );

    result.current.toggleHideCompleted();

    expect(onUpdateListHideCompleted).toHaveBeenCalledWith("list-1", true);
  });

  it("toggleHideCompleted は現在値(true)を反転させて onUpdateListHideCompleted を呼ぶ", () => {
    const onUpdateListHideCompleted = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailHideCompleted({
        list: { ...list, hideCompleted: true },
        onUpdateListHideCompleted,
      }),
    );

    result.current.toggleHideCompleted();

    expect(onUpdateListHideCompleted).toHaveBeenCalledWith("list-1", false);
  });

  it("toggleHideCompleted は対象リストのidを渡す", () => {
    const onUpdateListHideCompleted = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailHideCompleted({
        list: { ...list, id: "list-999" },
        onUpdateListHideCompleted,
      }),
    );

    result.current.toggleHideCompleted();

    expect(onUpdateListHideCompleted).toHaveBeenCalledWith(
      "list-999",
      expect.any(Boolean),
    );
  });

  it("再レンダー前に toggleHideCompleted を連続で呼んでも、2回目は1回目の反転結果をさらに反転させる（取りこぼさない）", () => {
    const onUpdateListHideCompleted = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailHideCompleted({
        list,
        onUpdateListHideCompleted,
      }),
    );

    // 再レンダーを挟まず連続で2回呼ぶ（ダブルクリック・連打を想定）
    result.current.toggleHideCompleted();
    result.current.toggleHideCompleted();

    expect(onUpdateListHideCompleted).toHaveBeenNthCalledWith(
      1,
      "list-1",
      true,
    );
    expect(onUpdateListHideCompleted).toHaveBeenNthCalledWith(
      2,
      "list-1",
      false,
    );
  });

  it("再レンダー後は list の最新値を基準にトグルする", () => {
    const onUpdateListHideCompleted = jest.fn();
    const { result, rerender } = renderHook(
      ({ list }) =>
        useTodoListDetailHideCompleted({ list, onUpdateListHideCompleted }),
      { initialProps: { list } },
    );

    result.current.toggleHideCompleted();
    expect(onUpdateListHideCompleted).toHaveBeenNthCalledWith(
      1,
      "list-1",
      true,
    );

    // 永続化ハンドラの結果を list に反映して再レンダー
    rerender({ list: { ...list, hideCompleted: true } });

    result.current.toggleHideCompleted();
    expect(onUpdateListHideCompleted).toHaveBeenNthCalledWith(
      2,
      "list-1",
      false,
    );
  });

  it("一度もトグルを呼ばずに外部要因（リモート同期等）で list.hideCompleted が変わった直後でも、最新値を基準に正しく反転する", () => {
    const onUpdateListHideCompleted = jest.fn();
    const { result, rerender } = renderHook(
      ({ list }) =>
        useTodoListDetailHideCompleted({ list, onUpdateListHideCompleted }),
      { initialProps: { list } },
    );

    // 自分でトグルを呼ばないまま、外部要因（別デバイスからの同期など）で
    // list.hideCompleted が true に変わったことを想定した再レンダー
    rerender({ list: { ...list, hideCompleted: true } });

    result.current.toggleHideCompleted();

    // 画面に表示されている最新値(true)を正しく反転してfalseを送る
    expect(onUpdateListHideCompleted).toHaveBeenCalledWith("list-1", false);
  });

  it("リストA でトグルした直後に別リスト(B)へ切り替わっても、Bの現在値を基準に正しく反転する（前リストの pending を引き継がない）", () => {
    const onUpdateListHideCompleted = jest.fn();
    const listA: TodoList = { ...list, id: "list-a", hideCompleted: false };
    const listB: TodoList = { ...list, id: "list-b", hideCompleted: false };

    const { result, rerender } = renderHook(
      ({ list }) =>
        useTodoListDetailHideCompleted({ list, onUpdateListHideCompleted }),
      { initialProps: { list: listA } },
    );

    // リストAでトグル（pending は A の反転結果 true を保持したままになる）
    result.current.toggleHideCompleted();
    expect(onUpdateListHideCompleted).toHaveBeenNthCalledWith(
      1,
      "list-a",
      true,
    );

    // 再レンダーを挟まずリストBへ切り替え（実運用では key による再マウントで
    // 発生しないが、フック単体としての防御性を検証する）
    rerender({ list: listB });

    result.current.toggleHideCompleted();

    // Aのpending(true)を引き継がず、Bの現在値(false)を正しく反転してtrueを送る
    expect(onUpdateListHideCompleted).toHaveBeenNthCalledWith(
      2,
      "list-b",
      true,
    );
  });
});
