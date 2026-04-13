import { type Routine } from "@/types/routine";
import type { RoutineCrudOps, RoutineData } from "../../pages/types";

jest.mock("../routineCrudPlan", () => ({
  createRoutineSubmitPlan: jest.fn(),
}));

import { createRoutineSubmitPlan } from "../routineCrudPlan";
import {
  applyRoutineSubmitPlan,
  closeRoutineCrudFormState,
  deleteRoutineWithConfirmation,
  finishRoutineCrudFormAction,
  openRoutineCrudFormState,
  restoreRoutineCrudScrollPosition,
  saveRoutineCrudScrollPosition,
} from "../routineCrudViewStateActions";

describe("routineCrudViewStateActions", () => {
  const routine: Routine = {
    id: "r1",
    groupId: "g1",
    title: "朝活",
    startTime: "08:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1, 3],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-02-12T00:00:00.000Z",
    updatedAt: "2026-02-12T00:00:00.000Z",
  };

  const routineData: RoutineData = {
    title: "朝活",
    startTime: "08:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1, 3],
    isCompleted: false,
    sortOrder: 0,
    notificationMinutes: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("scroll 保存と復元を行う", () => {
    const scrollRef = { current: 0 };
    const scrollTo = jest.fn();
    const schedule = jest.fn((callback: () => void) => {
      callback();
      return 0;
    });

    saveRoutineCrudScrollPosition(scrollRef, 240);
    expect(scrollRef.current).toBe(240);

    restoreRoutineCrudScrollPosition({ scrollRef, scrollTo, schedule });
    expect(scrollTo).toHaveBeenCalledWith(0, 240);
  });

  it("フォーム state を開閉する", () => {
    const scrollRef = { current: 0 };
    const setEditingRoutine = jest.fn();
    const setShowForm = jest.fn();
    const pushState = jest.fn();

    expect(
      openRoutineCrudFormState({
        isEditMode: false,
        routine,
        scrollTop: 120,
        scrollRef,
        setEditingRoutine,
        setShowForm,
        history: { pushState, back: jest.fn() },
      }),
    ).toBe(false);

    expect(
      openRoutineCrudFormState({
        isEditMode: true,
        routine,
        scrollTop: 120,
        scrollRef,
        setEditingRoutine,
        setShowForm,
        history: { pushState, back: jest.fn() },
      }),
    ).toBe(true);

    expect(scrollRef.current).toBe(120);
    expect(setEditingRoutine).toHaveBeenCalledWith(routine);
    expect(setShowForm).toHaveBeenCalledWith(true);
    expect(pushState).toHaveBeenCalledWith({ page: "form" }, "", "#form");

    closeRoutineCrudFormState({ setShowForm, setEditingRoutine });
    expect(setShowForm).toHaveBeenCalledWith(false);
    expect(setEditingRoutine).toHaveBeenCalledWith(undefined);
  });

  it("submit plan を各 CRUD 操作へ委譲する", () => {
    const ops: RoutineCrudOps = {
      routines: [routine],
      addRoutine: jest.fn(),
      updateRoutine: jest.fn(),
      deleteRoutine: jest.fn(),
      deleteRoutineGroup: jest.fn(),
    };

    (createRoutineSubmitPlan as jest.Mock)
      .mockReturnValueOnce({ type: "add-new" })
      .mockReturnValueOnce({ type: "update-single", routineId: "r1" });

    applyRoutineSubmitPlan({ routineData, ops });
    applyRoutineSubmitPlan({ editingRoutine: routine, routineData, ops });

    expect(ops.addRoutine).toHaveBeenCalledTimes(1);
    expect(ops.updateRoutine).toHaveBeenCalledWith("r1", routineData);
    expect(ops.deleteRoutineGroup).not.toHaveBeenCalled();
  });

  it("完了処理と削除処理を行う", () => {
    const closeForm = jest.fn();
    const back = jest.fn();
    const restoreScroll = jest.fn();

    finishRoutineCrudFormAction({
      closeForm,
      history: { pushState: jest.fn(), back },
      restoreScroll,
    });

    expect(closeForm).toHaveBeenCalled();
    expect(back).toHaveBeenCalled();
    expect(restoreScroll).toHaveBeenCalled();

    const deleteRoutine = jest.fn();
    const deleteRoutineGroup = jest.fn();
    const confirmDelete = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    expect(
      deleteRoutineWithConfirmation({
        routine: undefined,
        routines: [routine],
        confirmDelete,
        deleteRoutine,
        deleteRoutineGroup,
      }),
    ).toBe(false);

    expect(
      deleteRoutineWithConfirmation({
        routine,
        routines: [routine],
        confirmDelete,
        deleteRoutine,
        deleteRoutineGroup,
      }),
    ).toBe(false);

    expect(
      deleteRoutineWithConfirmation({
        routine: { ...routine, groupId: undefined },
        routines: [routine],
        confirmDelete,
        deleteRoutine,
        deleteRoutineGroup,
      }),
    ).toBe(true);

    expect(deleteRoutine).toHaveBeenCalledWith("r1");

    deleteRoutineWithConfirmation({
      routine,
      routines: [routine],
      confirmDelete: jest.fn(() => true),
      deleteRoutine,
      deleteRoutineGroup,
    });

    expect(deleteRoutineGroup).toHaveBeenCalledWith("g1");
  });
});
