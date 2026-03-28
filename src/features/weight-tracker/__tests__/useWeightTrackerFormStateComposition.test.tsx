import { renderHook } from "@testing-library/react";

jest.mock("../page/weightTrackerFormStateResult", () => ({
  createWeightTrackerFormStateResult: jest.fn(),
}));

jest.mock("../page/useWeightTrackerFormActions", () => ({
  useWeightTrackerFormActions: jest.fn(),
}));

jest.mock("../page/useWeightTrackerInputState", () => ({
  useWeightTrackerInputState: jest.fn(),
}));

jest.mock("../page/useWeightTrackerFormVisibilityState", () => ({
  useWeightTrackerFormVisibilityState: jest.fn(),
}));

import { createWeightTrackerFormStateResult } from "../page/weightTrackerFormStateResult";
import { useWeightTrackerFormActions } from "../page/useWeightTrackerFormActions";
import { useWeightTrackerFormVisibilityState } from "../page/useWeightTrackerFormVisibilityState";
import { useWeightTrackerInputState } from "../page/useWeightTrackerInputState";
import { useWeightTrackerFormState } from "../page/useWeightTrackerFormState";

describe("useWeightTrackerFormState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("form state と form action hook を compose する", () => {
    const actions = {
      handleCancelForm: jest.fn(),
    };
    const inputState = {
      notesInput: "",
      weightInput: "",
      setNotesInput: jest.fn(),
      setWeightInput: jest.fn(),
    };
    const visibilityState = {
      showForm: false,
      setShowForm: jest.fn(),
    };
    (useWeightTrackerInputState as jest.Mock).mockReturnValue(inputState);
    (useWeightTrackerFormVisibilityState as jest.Mock).mockReturnValue(
      visibilityState,
    );
    (useWeightTrackerFormActions as jest.Mock).mockReturnValue(actions);
    const resultState = {
      ...inputState,
      ...visibilityState,
      handleCancelForm: actions.handleCancelForm,
    };
    (createWeightTrackerFormStateResult as jest.Mock).mockReturnValue(
      resultState,
    );

    const { result } = renderHook(() =>
      useWeightTrackerFormState({
        initialTodayRecord: null,
        initialShowForm: false,
        getTodayWeightRecord: jest.fn(() => null),
      }),
    );

    expect(useWeightTrackerInputState).toHaveBeenCalledWith({
      initialWeightInput: "",
      initialNotesInput: "",
    });
    expect(useWeightTrackerFormVisibilityState).toHaveBeenCalledWith({
      initialShowForm: false,
    });
    expect(useWeightTrackerFormActions).toHaveBeenCalledWith({
      getTodayWeightRecord: expect.any(Function),
      setWeightInput: inputState.setWeightInput,
      setNotesInput: inputState.setNotesInput,
      setShowForm: visibilityState.setShowForm,
    });
    expect(createWeightTrackerFormStateResult).toHaveBeenCalledWith({
      inputState,
      visibilityState,
      handleCancelForm: actions.handleCancelForm,
    });
    expect(result.current).toBe(resultState);
  });
});
