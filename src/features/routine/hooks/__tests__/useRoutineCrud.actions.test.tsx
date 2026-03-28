import { renderHook } from "@testing-library/react";
import { useRoutineCrud } from "../useRoutineCrud";

jest.mock("../routineCrudActionBindings", () => ({
  createRoutineCrudActionBindings: jest.fn(),
}));

jest.mock("../routineCrudResult", () => ({
  createRoutineCrudResult: jest.fn(),
}));

jest.mock("../useRoutineCrudActionHandlers", () => ({
  useRoutineCrudActionHandlers: jest.fn(),
}));

jest.mock("../useRoutineCrudFormState", () => ({
  useRoutineCrudFormState: jest.fn(),
}));

import { createRoutineCrudActionBindings } from "../routineCrudActionBindings";
import { createRoutineCrudResult } from "../routineCrudResult";
import { useRoutineCrudActionHandlers } from "../useRoutineCrudActionHandlers";
import { useRoutineCrudFormState } from "../useRoutineCrudFormState";
import { buildOps, routine } from "./useRoutineCrud.test.setup";

describe("useRoutineCrud actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRoutineCrudFormState as jest.Mock).mockReturnValue({
      showForm: false,
      editingRoutine: undefined,
      closeForm: jest.fn(),
      openForm: jest.fn(),
      restoreScroll: jest.fn(),
    });
    (createRoutineCrudActionBindings as jest.Mock).mockImplementation(
      (params) => params,
    );
    (useRoutineCrudActionHandlers as jest.Mock).mockReturnValue({
      addRoutineAction: jest.fn(),
      editRoutineAction: jest.fn(),
      submitRoutineAction: jest.fn(),
      cancelRoutineAction: jest.fn(),
      deleteRoutineAction: jest.fn(),
    });
    (createRoutineCrudResult as jest.Mock).mockImplementation((params) => ({
      ...params.handlers,
      showForm: params.showForm,
      editingRoutine: params.editingRoutine,
      closeForm: params.closeForm,
    }));
  });

  it("form state・action bindings・result builder を compose する", () => {
    const ops = buildOps();

    const { result } = renderHook(() => useRoutineCrud(ops, true));

    expect(useRoutineCrudFormState).toHaveBeenCalledWith({ isEditMode: true });
    expect(createRoutineCrudActionBindings).toHaveBeenCalledWith({
      ops,
      editingRoutine: undefined,
      closeForm: (useRoutineCrudFormState as jest.Mock).mock.results[0].value
        .closeForm,
      openForm: (useRoutineCrudFormState as jest.Mock).mock.results[0].value
        .openForm,
      restoreScroll: (useRoutineCrudFormState as jest.Mock).mock.results[0]
        .value.restoreScroll,
    });
    expect(useRoutineCrudActionHandlers).toHaveBeenCalledWith(
      (createRoutineCrudActionBindings as jest.Mock).mock.results[0].value,
    );
    expect(createRoutineCrudResult).toHaveBeenCalledWith({
      showForm: false,
      editingRoutine: undefined,
      closeForm: (useRoutineCrudFormState as jest.Mock).mock.results[0].value
        .closeForm,
      handlers: (useRoutineCrudActionHandlers as jest.Mock).mock.results[0]
        .value,
    });
    expect(result.current).toEqual({
      ...(useRoutineCrudActionHandlers as jest.Mock).mock.results[0].value,
      showForm: false,
      editingRoutine: undefined,
      closeForm: (useRoutineCrudFormState as jest.Mock).mock.results[0].value
        .closeForm,
    });
  });

  it("editingRoutine も action bindings/result builder に渡す", () => {
    const ops = buildOps();
    (useRoutineCrudFormState as jest.Mock).mockReturnValue({
      showForm: true,
      editingRoutine: routine,
      closeForm: jest.fn(),
      openForm: jest.fn(),
      restoreScroll: jest.fn(),
    });

    renderHook(() => useRoutineCrud(ops, false));

    expect(createRoutineCrudActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        ops,
        editingRoutine: routine,
      }),
    );
    expect(createRoutineCrudResult).toHaveBeenCalledWith(
      expect.objectContaining({
        showForm: true,
        editingRoutine: routine,
      }),
    );
  });
});
