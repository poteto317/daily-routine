import { act, renderHook } from "@testing-library/react";
import type { Routine } from "@/types/routine";

jest.mock("@/features/routine/storage", () => ({
  saveRoutines: jest.fn(),
}));

import { saveRoutines } from "@/features/routine/storage";
import { useRoutineReorderMutation } from "../useRoutineReorderMutation";

describe("useRoutineReorderMutation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRoutine = (
    id: string,
    day: number,
    startTime: string,
    sortOrder: number,
    groupId: string,
  ): Routine => ({
    id,
    groupId,
    title: id,
    startTime,
    duration: 30,
    category: "work",
    daysOfWeek: [day],
    isCompleted: false,
    description: "",
    notificationMinutes: 0,
    sortOrder,
    createdAt: "2026-08-26T00:00:00.000Z",
    updatedAt: "2026-08-26T00:00:00.000Z",
  });

  it("表示中の曜日だけを並び替えても非表示の曜日を state と storage に保持する", () => {
    const weekdays = [1, 2, 3, 4, 5];
    const morningRoutines = weekdays.map((day, index) =>
      createRoutine(`morning-${day}`, day, "07:00", index, "morning-group"),
    );
    const eveningRoutines = weekdays.map((day, index) =>
      createRoutine(`evening-${day}`, day, "20:00", index + 5, "evening-group"),
    );
    const allRoutines = [...morningRoutines, ...eveningRoutines];
    const reorderedMonday = [
      { ...eveningRoutines[0], startTime: "07:00" },
      { ...morningRoutines[0], startTime: "20:00" },
    ];
    const setRoutines = jest.fn();
    const routinesRef = { current: allRoutines };

    const { result } = renderHook(() =>
      useRoutineReorderMutation(setRoutines, routinesRef),
    );

    act(() => {
      result.current(reorderedMonday, [morningRoutines[0], eveningRoutines[0]]);
    });

    const expectedIds = [
      "evening-1",
      "morning-2",
      "morning-3",
      "morning-4",
      "morning-5",
      "morning-1",
      "evening-2",
      "evening-3",
      "evening-4",
      "evening-5",
    ];
    expect(routinesRef.current.map((routine) => routine.id)).toEqual(
      expectedIds,
    );
    expect(setRoutines).toHaveBeenCalledWith(routinesRef.current);
    expect(
      routinesRef.current.filter((routine) => routine.daysOfWeek[0] !== 1),
    ).toEqual(allRoutines.filter((routine) => routine.daysOfWeek[0] !== 1));
    expect((saveRoutines as jest.Mock).mock.calls[0][0]).toHaveLength(10);
    expect(
      (saveRoutines as jest.Mock).mock.calls[0][0].map(
        (routine: Routine) => routine.id,
      ),
    ).toEqual(expectedIds);
  });

  it("storageへ保存するときは一時的な完了状態を除去する", () => {
    const completedRoutine = {
      ...createRoutine("completed", 1, "07:00", 0, "completed-group"),
      isCompleted: true,
    };
    const setRoutines = jest.fn();
    const routinesRef = { current: [completedRoutine] };

    const { result } = renderHook(() =>
      useRoutineReorderMutation(setRoutines, routinesRef),
    );

    act(() => {
      result.current([completedRoutine], [completedRoutine]);
    });

    expect(saveRoutines).toHaveBeenCalledWith([
      { ...completedRoutine, isCompleted: false },
    ]);
  });

  it("IDごとの開始時刻が変わった古い入力をstorageへ保存しない", () => {
    const sourceRoutines = [
      createRoutine("a", 1, "07:00", 0, "group-a"),
      createRoutine("b", 1, "08:00", 1, "group-b"),
      createRoutine("c", 1, "09:00", 2, "group-c"),
    ];
    const currentRoutines = [
      { ...sourceRoutines[0], startTime: "09:00" },
      { ...sourceRoutines[1], startTime: "07:00" },
      { ...sourceRoutines[2], startTime: "08:00" },
    ];
    const staleReorderedRoutines = [
      { ...sourceRoutines[2], startTime: "07:00" },
      { ...sourceRoutines[0], startTime: "08:00" },
      { ...sourceRoutines[1], startTime: "09:00" },
    ];
    const setRoutines = jest.fn();
    const routinesRef = { current: currentRoutines };

    const { result } = renderHook(() =>
      useRoutineReorderMutation(setRoutines, routinesRef),
    );

    act(() => {
      result.current(staleReorderedRoutines, sourceRoutines);
    });

    expect(routinesRef.current).toEqual(currentRoutines);
    expect(setRoutines).not.toHaveBeenCalled();
    expect(saveRoutines).not.toHaveBeenCalled();
  });
});
