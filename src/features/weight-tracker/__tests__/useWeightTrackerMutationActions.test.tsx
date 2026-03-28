import { act, renderHook } from "@testing-library/react";

jest.mock("../page/weightTrackerMutationActionsResult", () => ({
  createWeightTrackerMutationActionsResult: jest.fn(),
}));

jest.mock("../page/weightPageStateActions", () => ({
  createDeleteWeightHandler: jest.fn(),
  createSaveWeightHandler: jest.fn(),
}));

import { createWeightTrackerMutationActionsResult } from "../page/weightTrackerMutationActionsResult";
import {
  createDeleteWeightHandler,
  createSaveWeightHandler,
} from "../page/weightPageStateActions";
import { useWeightTrackerMutationActions } from "../page/useWeightTrackerMutationActions";

describe("useWeightTrackerMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createWeightTrackerMutationActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });

  it("save/delete handler を組み立てて委譲する", () => {
    const saveAction = jest.fn();
    const deleteAction = jest.fn();
    const resultShape = {
      handleDeleteRecord: jest.fn(),
      handleSaveWeight: jest.fn(),
      composed: true,
    };
    (createSaveWeightHandler as jest.Mock).mockReturnValue(saveAction);
    (createDeleteWeightHandler as jest.Mock).mockReturnValue(deleteAction);
    (createWeightTrackerMutationActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      today: "2024-01-12",
      weightInput: "69.5",
      notesInput: "memo",
      setTodayRecord: jest.fn(),
      setWeightInput: jest.fn(),
      setNotesInput: jest.fn(),
      setShowForm: jest.fn(),
      setRecentRecords: jest.fn(),
    };
    const { result } = renderHook(() =>
      useWeightTrackerMutationActions(params),
    );

    expect(result.current).toBe(resultShape);
    expect(createWeightTrackerMutationActionsResult).toHaveBeenCalledWith({
      handleDeleteRecord: expect.any(Function),
      handleSaveWeight: expect.any(Function),
    });

    const builtHandlers = (
      createWeightTrackerMutationActionsResult as jest.Mock
    ).mock.calls[0][0] as {
      handleDeleteRecord: (date: string) => void;
      handleSaveWeight: () => void;
    };

    act(() => {
      builtHandlers.handleSaveWeight();
      builtHandlers.handleDeleteRecord("2024-01-12");
    });

    expect(createSaveWeightHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        weightInput: "69.5",
        notesInput: "memo",
        setShowForm: params.setShowForm,
      }),
    );
    expect(createDeleteWeightHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        setTodayRecord: params.setTodayRecord,
        setWeightInput: params.setWeightInput,
        setNotesInput: params.setNotesInput,
        setRecentRecords: params.setRecentRecords,
      }),
    );
    expect(saveAction).toHaveBeenCalled();
    expect(deleteAction).toHaveBeenCalledWith("2024-01-12");
  });
});
