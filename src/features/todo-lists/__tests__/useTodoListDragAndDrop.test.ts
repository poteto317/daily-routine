import { act, renderHook } from "@testing-library/react";
import { useTodoListDragAndDrop } from "../useTodoListDragAndDrop";
import type { TodoListItem } from "../types";

const makeItem = (id: string): TodoListItem => ({
  id,
  title: `Item ${id}`,
  isCompleted: false,
  createdAt: new Date().toISOString(),
});

const items: TodoListItem[] = [makeItem("a"), makeItem("b"), makeItem("c")];

describe("useTodoListDragAndDrop", () => {
  it("初期状態: activeId は null", () => {
    const { result } = renderHook(() =>
      useTodoListDragAndDrop({
        items,
        listId: "list-1",
        onReorderItems: jest.fn(),
      }),
    );
    expect(result.current.activeId).toBeNull();
  });

  it("handleDragStart でアクティブIDがセットされる", () => {
    const { result } = renderHook(() =>
      useTodoListDragAndDrop({
        items,
        listId: "list-1",
        onReorderItems: jest.fn(),
      }),
    );
    act(() => {
      result.current.handleDragStart({
        active: { id: "a" },
      } as Parameters<typeof result.current.handleDragStart>[0]);
    });
    expect(result.current.activeId).toBe("a");
  });

  it("handleDragStart で onDragStarted コールバックが呼ばれる", () => {
    const onDragStarted = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDragAndDrop({
        items,
        listId: "list-1",
        onReorderItems: jest.fn(),
        onDragStarted,
      }),
    );
    act(() => {
      result.current.handleDragStart({
        active: { id: "a" },
      } as Parameters<typeof result.current.handleDragStart>[0]);
    });
    expect(onDragStarted).toHaveBeenCalledTimes(1);
  });

  it("handleDragCancel で activeId が null に戻る", () => {
    const { result } = renderHook(() =>
      useTodoListDragAndDrop({
        items,
        listId: "list-1",
        onReorderItems: jest.fn(),
      }),
    );
    act(() => {
      result.current.handleDragStart({
        active: { id: "a" },
      } as Parameters<typeof result.current.handleDragStart>[0]);
    });
    act(() => {
      result.current.handleDragCancel();
    });
    expect(result.current.activeId).toBeNull();
  });

  it("handleDragEnd で onReorderItems が正しい引数で呼ばれる", () => {
    const onReorderItems = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDragAndDrop({
        items,
        listId: "list-1",
        onReorderItems,
      }),
    );
    act(() => {
      result.current.handleDragEnd({
        active: { id: "a" },
        over: { id: "c" },
      } as Parameters<typeof result.current.handleDragEnd>[0]);
    });
    // items: a=0, b=1, c=2 なので fromIndex=0, toIndex=2
    expect(onReorderItems).toHaveBeenCalledWith("list-1", 0, 2);
    expect(result.current.activeId).toBeNull();
  });

  it("handleDragEnd で active と over が同じ場合は onReorderItems を呼ばない", () => {
    const onReorderItems = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDragAndDrop({
        items,
        listId: "list-1",
        onReorderItems,
      }),
    );
    act(() => {
      result.current.handleDragEnd({
        active: { id: "a" },
        over: { id: "a" },
      } as Parameters<typeof result.current.handleDragEnd>[0]);
    });
    expect(onReorderItems).not.toHaveBeenCalled();
  });

  it("handleDragEnd で over が null の場合は onReorderItems を呼ばない", () => {
    const onReorderItems = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDragAndDrop({
        items,
        listId: "list-1",
        onReorderItems,
      }),
    );
    act(() => {
      result.current.handleDragEnd({
        active: { id: "a" },
        over: null,
      } as Parameters<typeof result.current.handleDragEnd>[0]);
    });
    expect(onReorderItems).not.toHaveBeenCalled();
  });

  describe("disabled", () => {
    it("disabled=false（デフォルト）のとき sensors が空でない", () => {
      const { result } = renderHook(() =>
        useTodoListDragAndDrop({
          items,
          listId: "list-1",
          onReorderItems: jest.fn(),
        }),
      );
      expect(result.current.sensors.length).toBeGreaterThan(0);
    });

    it("disabled=true のとき sensors が空配列になり DnD が無効化される", () => {
      const { result } = renderHook(() =>
        useTodoListDragAndDrop({
          items,
          listId: "list-1",
          onReorderItems: jest.fn(),
          disabled: true,
        }),
      );
      expect(result.current.sensors).toEqual([]);
    });

    it("disabled が false → true に切り替わると sensors が空になる", () => {
      const { result, rerender } = renderHook(
        ({ disabled }) =>
          useTodoListDragAndDrop({
            items,
            listId: "list-1",
            onReorderItems: jest.fn(),
            disabled,
          }),
        { initialProps: { disabled: false } },
      );
      expect(result.current.sensors.length).toBeGreaterThan(0);

      rerender({ disabled: true });
      expect(result.current.sensors).toEqual([]);
    });

    it("disabled が true → false に切り替わると sensors が空でなくなる", () => {
      const { result, rerender } = renderHook(
        ({ disabled }) =>
          useTodoListDragAndDrop({
            items,
            listId: "list-1",
            onReorderItems: jest.fn(),
            disabled,
          }),
        { initialProps: { disabled: true } },
      );
      expect(result.current.sensors).toEqual([]);

      rerender({ disabled: false });
      expect(result.current.sensors.length).toBeGreaterThan(0);
    });

    it("disabled=true のとき sensors の参照がレンダーをまたいで安定している", () => {
      const { result, rerender } = renderHook(() =>
        useTodoListDragAndDrop({
          items,
          listId: "list-1",
          onReorderItems: jest.fn(),
          disabled: true,
        }),
      );
      const first = result.current.sensors;
      rerender();
      expect(result.current.sensors).toBe(first);
    });
  });
});
