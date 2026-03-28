import { act, renderHook } from "@testing-library/react";
import "./useRoutineCrud.test.setup";
import { useRoutineCrudActionHandlers } from "../useRoutineCrudActionHandlers";
import {
  buildOps,
  mockConfirmDeleteRoutine,
  restoreHistoryMocks,
  routine,
  routineData,
  setupHistoryMocks,
} from "./useRoutineCrud.test.setup";

describe("useRoutineCrudActionHandlers", () => {
  beforeEach(setupHistoryMocks);
  afterEach(restoreHistoryMocks);

  it("submitRoutineActionで更新後にフォームを閉じてスクロールを復元する", () => {
    const ops = buildOps();
    const closeForm = jest.fn();
    const openForm = jest.fn();
    const restoreScroll = jest.fn();

    const { result } = renderHook(() =>
      useRoutineCrudActionHandlers({
        ops,
        editingRoutine: routine,
        closeForm,
        openForm,
        restoreScroll,
      }),
    );

    act(() => result.current.submitRoutineAction(routineData, [1, 3]));

    expect(ops.updateRoutineGroup).toHaveBeenCalledWith("g1", routineData);
    expect(closeForm).toHaveBeenCalledTimes(1);
    expect(window.history.back).toHaveBeenCalledTimes(1);
    expect(restoreScroll).toHaveBeenCalledTimes(1);
  });

  it("cancelRoutineActionで mutation を伴わずにフォーム終了処理だけ行う", () => {
    const ops = buildOps();
    const closeForm = jest.fn();
    const openForm = jest.fn();
    const restoreScroll = jest.fn();

    const { result } = renderHook(() =>
      useRoutineCrudActionHandlers({
        ops,
        closeForm,
        openForm,
        restoreScroll,
      }),
    );

    act(() => result.current.cancelRoutineAction());

    expect(ops.addRoutine).not.toHaveBeenCalled();
    expect(ops.updateRoutine).not.toHaveBeenCalled();
    expect(ops.updateRoutineGroup).not.toHaveBeenCalled();
    expect(closeForm).toHaveBeenCalledTimes(1);
    expect(window.history.back).toHaveBeenCalledTimes(1);
    expect(restoreScroll).toHaveBeenCalledTimes(1);
  });

  it("存在しないIDの deleteRoutineAction は確認ダイアログを呼ばない", () => {
    const ops = buildOps();

    const { result } = renderHook(() =>
      useRoutineCrudActionHandlers({
        ops,
        closeForm: jest.fn(),
        openForm: jest.fn(),
        restoreScroll: jest.fn(),
      }),
    );

    act(() => result.current.deleteRoutineAction("missing"));

    expect(mockConfirmDeleteRoutine).not.toHaveBeenCalled();
    expect(ops.deleteRoutine).not.toHaveBeenCalled();
    expect(ops.deleteRoutineGroup).not.toHaveBeenCalled();
  });
});
