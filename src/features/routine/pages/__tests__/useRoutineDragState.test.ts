import { renderHook, act } from "@testing-library/react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useRoutineDragState } from "../useRoutineDragState";
import type { Routine } from "@/types/routine";

// reorderRoutinesWithOriginalTimes の実装をそのまま使う
// （arrayMove は @dnd-kit/sortable に依存するためモックは最小限にとどめる）

const makeRoutine = (id: string, startTime: string): Routine => ({
  id,
  title: `Routine ${id}`,
  startTime,
  duration: 30,
  category: "other",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

const makeDragStartEvent = (id: string): DragStartEvent =>
  ({ active: { id } }) as unknown as DragStartEvent;

const makeDragEndEvent = (
  activeId: string,
  overId: string | null,
): DragEndEvent =>
  ({
    active: { id: activeId },
    over: overId ? { id: overId } : null,
  }) as unknown as DragEndEvent;

describe("useRoutineDragState", () => {
  const routines = [
    makeRoutine("a", "07:00"),
    makeRoutine("b", "08:00"),
    makeRoutine("c", "09:00"),
  ];

  it("初期状態では activeId と activeRoutine が null", () => {
    const { result } = renderHook(() =>
      useRoutineDragState({ routines, onReorderAction: jest.fn() }),
    );
    expect(result.current.activeId).toBeNull();
    expect(result.current.activeRoutine).toBeNull();
  });

  it("handleDragStart を呼ぶと activeId と activeRoutine が設定される", () => {
    const { result } = renderHook(() =>
      useRoutineDragState({ routines, onReorderAction: jest.fn() }),
    );

    act(() => {
      result.current.handleDragStart(makeDragStartEvent("b"));
    });

    expect(result.current.activeId).toBe("b");
    expect(result.current.activeRoutine).toBe(routines[1]);
  });

  it("handleDragCancel を呼ぶと activeId が null に戻る", () => {
    const { result } = renderHook(() =>
      useRoutineDragState({ routines, onReorderAction: jest.fn() }),
    );

    act(() => {
      result.current.handleDragStart(makeDragStartEvent("a"));
    });
    act(() => {
      result.current.handleDragCancel();
    });

    expect(result.current.activeId).toBeNull();
    expect(result.current.activeRoutine).toBeNull();
  });

  it("handleDragEnd を呼ぶと activeId が null に戻り onReorderAction が呼ばれる", () => {
    const onReorderAction = jest.fn();
    const { result } = renderHook(() =>
      useRoutineDragState({ routines, onReorderAction }),
    );

    act(() => {
      result.current.handleDragStart(makeDragStartEvent("a"));
    });
    act(() => {
      result.current.handleDragEnd(makeDragEndEvent("a", "c"));
    });

    expect(result.current.activeId).toBeNull();
    expect(onReorderAction).toHaveBeenCalledTimes(1);
    const reordered: Routine[] = onReorderAction.mock.calls[0][0];
    expect(reordered.map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("over が null の場合 onReorderAction は呼ばれない", () => {
    const onReorderAction = jest.fn();
    const { result } = renderHook(() =>
      useRoutineDragState({ routines, onReorderAction }),
    );

    act(() => {
      result.current.handleDragStart(makeDragStartEvent("a"));
    });
    act(() => {
      result.current.handleDragEnd(makeDragEndEvent("a", null));
    });

    expect(onReorderAction).not.toHaveBeenCalled();
  });

  it("active と over が同じ ID の場合 onReorderAction は呼ばれない", () => {
    const onReorderAction = jest.fn();
    const { result } = renderHook(() =>
      useRoutineDragState({ routines, onReorderAction }),
    );

    act(() => {
      result.current.handleDragStart(makeDragStartEvent("b"));
    });
    act(() => {
      result.current.handleDragEnd(makeDragEndEvent("b", "b"));
    });

    expect(onReorderAction).not.toHaveBeenCalled();
  });

  it("存在しない activeId の場合 onReorderAction は呼ばれない", () => {
    const onReorderAction = jest.fn();
    const { result } = renderHook(() =>
      useRoutineDragState({ routines, onReorderAction }),
    );

    act(() => {
      result.current.handleDragEnd(makeDragEndEvent("x", "a"));
    });

    expect(onReorderAction).not.toHaveBeenCalled();
  });
});
