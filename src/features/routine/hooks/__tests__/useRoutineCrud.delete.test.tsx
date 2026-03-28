import { act, renderHook } from "@testing-library/react";
import "./useRoutineCrud.test.setup";
import { useRoutineCrud } from "../useRoutineCrud";
import {
  buildOps,
  mockConfirmDeleteRoutine,
  restoreHistoryMocks,
  routine,
  setupHistoryMocks,
} from "./useRoutineCrud.test.setup";

describe("useRoutineCrud delete", () => {
  beforeEach(setupHistoryMocks);
  afterEach(restoreHistoryMocks);

  it("確認OKかつグループありならdeleteRoutineGroup", () => {
    const ops = buildOps();
    mockConfirmDeleteRoutine.mockReturnValue(true);
    const { result } = renderHook(() => useRoutineCrud(ops, true));
    act(() => result.current.deleteRoutineAction("r1"));
    expect(mockConfirmDeleteRoutine).toHaveBeenCalledWith(
      routine,
      ops.routines,
    );
    expect(ops.deleteRoutineGroup).toHaveBeenCalledWith("g1");
  });

  it("確認NGなら削除しない", () => {
    const ops = buildOps();
    mockConfirmDeleteRoutine.mockReturnValue(false);
    const { result } = renderHook(() => useRoutineCrud(ops, true));
    act(() => result.current.deleteRoutineAction("r1"));
    expect(ops.deleteRoutineGroup).not.toHaveBeenCalled();
    expect(ops.deleteRoutine).not.toHaveBeenCalled();
  });
});
