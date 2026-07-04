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
});
