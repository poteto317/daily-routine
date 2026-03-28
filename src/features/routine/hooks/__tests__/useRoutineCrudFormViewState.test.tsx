import { act, renderHook } from "@testing-library/react";

jest.mock("../routineCrudFormViewStateResult", () => ({
  createRoutineCrudFormViewStateResult: jest.fn(),
}));

import { createRoutineCrudFormViewStateResult } from "../routineCrudFormViewStateResult";
import { useRoutineCrudFormViewState } from "../useRoutineCrudFormViewState";
import { routine } from "./useRoutineCrud.test.setup";

describe("useRoutineCrudFormViewState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createRoutineCrudFormViewStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("showForm と editingRoutine state を管理する", () => {
    const { result } = renderHook(() => useRoutineCrudFormViewState());

    expect(result.current.showForm).toBe(false);
    expect(result.current.editingRoutine).toBeUndefined();
    expect(createRoutineCrudFormViewStateResult).toHaveBeenCalledWith({
      editingRoutine: undefined,
      setEditingRoutine: expect.any(Function),
      setShowForm: expect.any(Function),
      showForm: false,
    });

    act(() => {
      result.current.setShowForm(true);
      result.current.setEditingRoutine(routine);
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.editingRoutine).toEqual(routine);
    expect(createRoutineCrudFormViewStateResult).toHaveBeenLastCalledWith({
      editingRoutine: routine,
      setEditingRoutine: expect.any(Function),
      setShowForm: expect.any(Function),
      showForm: true,
    });
  });
});
