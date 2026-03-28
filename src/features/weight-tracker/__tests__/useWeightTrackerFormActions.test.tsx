import { renderHook } from "@testing-library/react";

jest.mock("../page/weightPageStateActions", () => ({
  createCancelWeightFormHandler: jest.fn(),
}));

import { createCancelWeightFormHandler } from "../page/weightPageStateActions";
import { useWeightTrackerFormActions } from "../page/useWeightTrackerFormActions";

describe("useWeightTrackerFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cancel form handler を組み立てる", () => {
    const handleCancelForm = jest.fn();
    const params = {
      getTodayWeightRecord: jest.fn(),
      setWeightInput: jest.fn(),
      setNotesInput: jest.fn(),
      setShowForm: jest.fn(),
    };

    (createCancelWeightFormHandler as jest.Mock).mockReturnValue(
      handleCancelForm,
    );

    const { result } = renderHook(() => useWeightTrackerFormActions(params));

    expect(createCancelWeightFormHandler).toHaveBeenCalledWith({
      getTodayWeightRecord: params.getTodayWeightRecord,
      setWeightInput: params.setWeightInput,
      setNotesInput: params.setNotesInput,
      setShowForm: params.setShowForm,
    });
    expect(result.current).toEqual({
      handleCancelForm,
    });
  });
});
