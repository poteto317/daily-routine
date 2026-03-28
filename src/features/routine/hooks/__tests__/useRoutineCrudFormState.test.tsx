import { renderHook } from "@testing-library/react";

jest.mock("../useRoutineCrudFormActions", () => ({
  useRoutineCrudFormActions: jest.fn(),
}));

jest.mock("../useRoutineCrudScrollRestoration", () => ({
  useRoutineCrudScrollRestoration: jest.fn(),
}));

jest.mock("../useRoutineCrudFormViewState", () => ({
  useRoutineCrudFormViewState: jest.fn(),
}));

jest.mock("../routineCrudFormStateResult", () => ({
  createRoutineCrudFormStateResult: jest.fn(),
}));

import { createRoutineCrudFormStateResult } from "../routineCrudFormStateResult";
import { useRoutineCrudFormActions } from "../useRoutineCrudFormActions";
import { useRoutineCrudFormState } from "../useRoutineCrudFormState";
import { useRoutineCrudFormViewState } from "../useRoutineCrudFormViewState";
import { useRoutineCrudScrollRestoration } from "../useRoutineCrudScrollRestoration";

describe("useRoutineCrudFormState", () => {
  const scrollRestoration = {
    restoreScroll: jest.fn(),
    scrollRef: { current: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoutineCrudScrollRestoration as jest.Mock).mockReturnValue(
      scrollRestoration,
    );
    (useRoutineCrudFormViewState as jest.Mock).mockReturnValue({
      showForm: false,
      editingRoutine: undefined,
      setShowForm: jest.fn(),
      setEditingRoutine: jest.fn(),
    });
    (useRoutineCrudFormActions as jest.Mock).mockReturnValue({
      closeForm: jest.fn(),
      openForm: jest.fn(),
    });
    (createRoutineCrudFormStateResult as jest.Mock).mockImplementation(
      ({ restoreScroll, viewState, actions }) => ({
        showForm: viewState.showForm,
        editingRoutine: viewState.editingRoutine,
        closeForm: actions.closeForm,
        openForm: actions.openForm,
        restoreScroll,
      }),
    );
  });

  it("view state と scroll restoration と form actions を compose し result builder へ委譲する", () => {
    const { result } = renderHook(() =>
      useRoutineCrudFormState({ isEditMode: true }),
    );

    expect(useRoutineCrudFormViewState).toHaveBeenCalledTimes(1);
    expect(useRoutineCrudScrollRestoration).toHaveBeenCalled();
    expect(useRoutineCrudFormActions).toHaveBeenCalledWith({
      isEditMode: true,
      scrollRef: scrollRestoration.scrollRef,
      setEditingRoutine: expect.any(Function),
      setShowForm: expect.any(Function),
    });
    expect(createRoutineCrudFormStateResult).toHaveBeenCalledWith({
      restoreScroll: scrollRestoration.restoreScroll,
      viewState: (useRoutineCrudFormViewState as jest.Mock).mock.results[0]
        .value,
      actions: {
        closeForm: (useRoutineCrudFormActions as jest.Mock).mock.results[0]
          .value.closeForm,
        openForm: (useRoutineCrudFormActions as jest.Mock).mock.results[0].value
          .openForm,
      },
    });
    expect(result.current).toEqual({
      showForm: false,
      editingRoutine: undefined,
      closeForm: expect.any(Function),
      openForm: expect.any(Function),
      restoreScroll: scrollRestoration.restoreScroll,
    });
  });
});
