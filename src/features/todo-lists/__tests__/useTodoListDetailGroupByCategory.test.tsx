import { renderHook } from "@testing-library/react";
import type { TodoList } from "../types";
import { useTodoListDetailGroupByCategory } from "../useTodoListDetailGroupByCategory";

const list: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("useTodoListDetailGroupByCategory", () => {
  it("list.groupByCategory が未設定の場合は false を返す", () => {
    const { result } = renderHook(() =>
      useTodoListDetailGroupByCategory({
        list,
        onUpdateListGroupByCategory: jest.fn(),
      }),
    );

    expect(result.current.groupByCategory).toBe(false);
  });

  it("list.groupByCategory の値をそのまま返す", () => {
    const { result } = renderHook(() =>
      useTodoListDetailGroupByCategory({
        list: { ...list, groupByCategory: true },
        onUpdateListGroupByCategory: jest.fn(),
      }),
    );

    expect(result.current.groupByCategory).toBe(true);
  });

  it("toggleGroupByCategory は現在値を反転させて onUpdateListGroupByCategory を呼ぶ", () => {
    const onUpdateListGroupByCategory = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailGroupByCategory({
        list,
        onUpdateListGroupByCategory,
      }),
    );

    result.current.toggleGroupByCategory();

    expect(onUpdateListGroupByCategory).toHaveBeenCalledWith("list-1", true);
  });

  it("groupByCategory が true のとき toggle で false になる", () => {
    const onUpdateListGroupByCategory = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailGroupByCategory({
        list: { ...list, groupByCategory: true },
        onUpdateListGroupByCategory,
      }),
    );

    result.current.toggleGroupByCategory();

    expect(onUpdateListGroupByCategory).toHaveBeenCalledWith("list-1", false);
  });

  it("再レンダー前に toggleGroupByCategory を連続で呼んでも、2回目は1回目の反転結果をさらに反転させる（取りこぼさない）", () => {
    const onUpdateListGroupByCategory = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailGroupByCategory({
        list,
        onUpdateListGroupByCategory,
      }),
    );

    result.current.toggleGroupByCategory();
    result.current.toggleGroupByCategory();

    expect(onUpdateListGroupByCategory).toHaveBeenNthCalledWith(
      1,
      "list-1",
      true,
    );
    expect(onUpdateListGroupByCategory).toHaveBeenNthCalledWith(
      2,
      "list-1",
      false,
    );
  });

  it("再レンダー後は list の最新値を基準にトグルする", () => {
    const onUpdateListGroupByCategory = jest.fn();
    const { result, rerender } = renderHook(
      ({ list }) =>
        useTodoListDetailGroupByCategory({
          list,
          onUpdateListGroupByCategory,
        }),
      { initialProps: { list } },
    );

    result.current.toggleGroupByCategory();
    expect(onUpdateListGroupByCategory).toHaveBeenNthCalledWith(
      1,
      "list-1",
      true,
    );

    rerender({ list: { ...list, groupByCategory: true } });

    result.current.toggleGroupByCategory();
    expect(onUpdateListGroupByCategory).toHaveBeenNthCalledWith(
      2,
      "list-1",
      false,
    );
  });

  it("一度もトグルを呼ばずに外部要因（リモート同期等）で list.groupByCategory が変わった直後でも、最新値を基準に正しく反転する", () => {
    const onUpdateListGroupByCategory = jest.fn();
    const { result, rerender } = renderHook(
      ({ list }) =>
        useTodoListDetailGroupByCategory({
          list,
          onUpdateListGroupByCategory,
        }),
      { initialProps: { list } },
    );

    rerender({ list: { ...list, groupByCategory: true } });

    result.current.toggleGroupByCategory();

    expect(onUpdateListGroupByCategory).toHaveBeenCalledWith(
      "list-1",
      false,
    );
  });

  it("リストA でトグルした直後に別リスト(B)へ切り替わっても、Bの現在値を基準に正しく反転する（前リストの pending を引き継がない）", () => {
    const onUpdateListGroupByCategory = jest.fn();
    const listA: TodoList = {
      ...list,
      id: "list-a",
      groupByCategory: false,
    };
    const listB: TodoList = {
      ...list,
      id: "list-b",
      groupByCategory: false,
    };

    const { result, rerender } = renderHook(
      ({ list }) =>
        useTodoListDetailGroupByCategory({
          list,
          onUpdateListGroupByCategory,
        }),
      { initialProps: { list: listA } },
    );

    result.current.toggleGroupByCategory();
    expect(onUpdateListGroupByCategory).toHaveBeenNthCalledWith(
      1,
      "list-a",
      true,
    );

    rerender({ list: listB });

    result.current.toggleGroupByCategory();

    expect(onUpdateListGroupByCategory).toHaveBeenNthCalledWith(
      2,
      "list-b",
      true,
    );
  });
});
