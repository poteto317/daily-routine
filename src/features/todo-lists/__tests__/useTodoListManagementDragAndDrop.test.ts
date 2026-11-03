import type { DragEndEvent } from "@dnd-kit/core";
import { renderHook } from "@testing-library/react";

// センサーの種類と設定値は useTodoDndSensors.test.ts が確かめる。
// ここでは共通のセンサーをそのまま返すこと（同一性）だけを確かめる。
const mockSharedSensors = [{ sensor: "shared" }];
jest.mock("../useTodoDndSensors", () => ({
  useTodoDndSensors: () => mockSharedSensors,
}));

import { useTodoListManagementDragAndDrop } from "../useTodoListManagementDragAndDrop";

const dragEnd = (activeId: string, overId: string | null) =>
  ({
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  }) as unknown as DragEndEvent;

describe("useTodoListManagementDragAndDrop", () => {
  it("over が null なら onReorderLists を呼ばない", () => {
    const onReorderLists = jest.fn();
    const { result } = renderHook(() =>
      useTodoListManagementDragAndDrop({ onReorderLists }),
    );

    result.current.handleDragEnd(dragEnd("list-a", null));

    expect(onReorderLists).not.toHaveBeenCalled();
  });

  it("active と over が同じなら onReorderLists を呼ばない", () => {
    const onReorderLists = jest.fn();
    const { result } = renderHook(() =>
      useTodoListManagementDragAndDrop({ onReorderLists }),
    );

    result.current.handleDragEnd(dragEnd("list-a", "list-a"));

    expect(onReorderLists).not.toHaveBeenCalled();
  });

  it("active と over が違えば (active の ID, over の ID) の順で呼ぶ", () => {
    const onReorderLists = jest.fn();
    const { result } = renderHook(() =>
      useTodoListManagementDragAndDrop({ onReorderLists }),
    );

    result.current.handleDragEnd(dragEnd("list-c", "list-a"));

    expect(onReorderLists).toHaveBeenCalledTimes(1);
    expect(onReorderLists).toHaveBeenCalledWith("list-c", "list-a");
  });

  it("sensors は共通の useTodoDndSensors の戻り値をそのまま返す", () => {
    const { result } = renderHook(() =>
      useTodoListManagementDragAndDrop({ onReorderLists: jest.fn() }),
    );

    expect(result.current.sensors).toBe(mockSharedSensors);
  });
});
