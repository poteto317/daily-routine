import { act, renderHook } from "@testing-library/react";
import { useTodoCategoryDragAndDrop } from "../useTodoCategoryDragAndDrop";
import type { TodoCategory } from "../types";

const makeCategory = (id: string): TodoCategory => ({
  id,
  name: `Category ${id}`,
  createdAt: new Date().toISOString(),
});

const categories: TodoCategory[] = [
  makeCategory("a"),
  makeCategory("b"),
  makeCategory("c"),
];

describe("useTodoCategoryDragAndDrop", () => {
  it("初期状態: activeId は null", () => {
    const { result } = renderHook(() =>
      useTodoCategoryDragAndDrop({
        categories,
        onReorderCategories: jest.fn(),
      }),
    );
    expect(result.current.activeId).toBeNull();
  });

  it("handleDragStart でアクティブIDがセットされる", () => {
    const { result } = renderHook(() =>
      useTodoCategoryDragAndDrop({
        categories,
        onReorderCategories: jest.fn(),
      }),
    );
    act(() => {
      result.current.handleDragStart({
        active: { id: "a" },
      } as Parameters<typeof result.current.handleDragStart>[0]);
    });
    expect(result.current.activeId).toBe("a");
  });

  it("handleDragCancel で activeId が null に戻る", () => {
    const { result } = renderHook(() =>
      useTodoCategoryDragAndDrop({
        categories,
        onReorderCategories: jest.fn(),
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

  it("handleDragEnd で onReorderCategories が正しい引数で呼ばれる", () => {
    const onReorderCategories = jest.fn();
    const { result } = renderHook(() =>
      useTodoCategoryDragAndDrop({
        categories,
        onReorderCategories,
      }),
    );
    act(() => {
      result.current.handleDragEnd({
        active: { id: "a" },
        over: { id: "c" },
      } as Parameters<typeof result.current.handleDragEnd>[0]);
    });
    // categories: a=0, b=1, c=2 なので fromIndex=0, toIndex=2
    expect(onReorderCategories).toHaveBeenCalledWith(0, 2);
    expect(result.current.activeId).toBeNull();
  });

  it("handleDragEnd で active と over が同じ場合は onReorderCategories を呼ばない", () => {
    const onReorderCategories = jest.fn();
    const { result } = renderHook(() =>
      useTodoCategoryDragAndDrop({
        categories,
        onReorderCategories,
      }),
    );
    act(() => {
      result.current.handleDragEnd({
        active: { id: "a" },
        over: { id: "a" },
      } as Parameters<typeof result.current.handleDragEnd>[0]);
    });
    expect(onReorderCategories).not.toHaveBeenCalled();
  });

  it("handleDragEnd で over が null の場合は onReorderCategories を呼ばない", () => {
    const onReorderCategories = jest.fn();
    const { result } = renderHook(() =>
      useTodoCategoryDragAndDrop({
        categories,
        onReorderCategories,
      }),
    );
    act(() => {
      result.current.handleDragEnd({
        active: { id: "a" },
        over: null,
      } as Parameters<typeof result.current.handleDragEnd>[0]);
    });
    expect(onReorderCategories).not.toHaveBeenCalled();
  });

  it("sensorsは常に非空", () => {
    const { result } = renderHook(() =>
      useTodoCategoryDragAndDrop({
        categories,
        onReorderCategories: jest.fn(),
      }),
    );
    expect(result.current.sensors.length).toBeGreaterThan(0);
  });
});
