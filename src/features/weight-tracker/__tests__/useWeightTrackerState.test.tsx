import { renderHook } from "@testing-library/react";

jest.mock("../page/weightPageActionBindings", () => ({
  createWeightPageActionBindings: jest.fn(),
}));

jest.mock("../page/weightTrackerStateResult", () => ({
  createWeightTrackerStateResult: jest.fn(),
}));

jest.mock("../page/useWeightTrackerActions", () => ({
  useWeightTrackerActions: jest.fn(),
}));

jest.mock("../page/useWeightTrackerDataState", () => ({
  useWeightTrackerDataState: jest.fn(),
}));

jest.mock("../page/useWeightTrackerFormState", () => ({
  useWeightTrackerFormState: jest.fn(),
}));

import { createWeightPageActionBindings } from "../page/weightPageActionBindings";
import { createWeightTrackerStateResult } from "../page/weightTrackerStateResult";
import { useWeightTrackerActions } from "../page/useWeightTrackerActions";
import { useWeightTrackerDataState } from "../page/useWeightTrackerDataState";
import { useWeightTrackerFormState } from "../page/useWeightTrackerFormState";
import { useWeightTrackerState } from "../page/useWeightTrackerState";

describe("useWeightTrackerState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const dataState = {
      initialTodayRecord: null,
      recentRecords: [],
      setRecentRecords: jest.fn(),
      setTodayRecord: jest.fn(),
      today: "2024-01-12",
      todayRecord: null,
    };
    const formState = {
      notesInput: "",
      showForm: false,
      weightInput: "",
      handleCancelForm: jest.fn(),
      setNotesInput: jest.fn(),
      setShowForm: jest.fn(),
      setWeightInput: jest.fn(),
    };
    const actionBindings = { bound: true };
    const actionState = {
      handleDeleteRecord: jest.fn(),
      handleSaveWeight: jest.fn(),
    };
    const resultState = { composed: true };

    (useWeightTrackerDataState as jest.Mock).mockReturnValue(dataState);
    (useWeightTrackerFormState as jest.Mock).mockReturnValue(formState);
    (createWeightPageActionBindings as jest.Mock).mockReturnValue(
      actionBindings,
    );
    (useWeightTrackerActions as jest.Mock).mockReturnValue(actionState);
    (createWeightTrackerStateResult as jest.Mock).mockReturnValue(resultState);
  });

  it("data/form/actions/result を compose する", () => {
    const { result } = renderHook(() => useWeightTrackerState());

    expect(useWeightTrackerFormState).toHaveBeenCalledWith(
      expect.objectContaining({
        initialTodayRecord: null,
        getTodayWeightRecord: expect.any(Function),
      }),
    );
    expect(createWeightPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        weightInput: "",
        notesInput: "",
      }),
    );
    expect(useWeightTrackerActions).toHaveBeenCalledWith({ bound: true });
    expect(createWeightTrackerStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        todayRecord: null,
        recentRecords: [],
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });
});
