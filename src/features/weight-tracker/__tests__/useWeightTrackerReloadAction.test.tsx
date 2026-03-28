import { act, renderHook } from "@testing-library/react";

jest.mock("../page/weightPageStateActions", () => ({
  createLoadWeightDataAction: jest.fn(),
}));

jest.mock("../page/weightTrackerReloadActionResult", () => ({
  createWeightTrackerReloadActionResult: jest.fn(),
}));

import { createLoadWeightDataAction } from "../page/weightPageStateActions";
import { createWeightTrackerReloadActionResult } from "../page/weightTrackerReloadActionResult";
import { useWeightTrackerReloadAction } from "../page/useWeightTrackerReloadAction";

describe("useWeightTrackerReloadAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reload action を組み立てて委譲する", () => {
    const loadAction = jest.fn();
    const resultShape = { reloadWeightData: loadAction, composed: true };
    (createLoadWeightDataAction as jest.Mock).mockReturnValue(loadAction);
    (createWeightTrackerReloadActionResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      setTodayRecord: jest.fn(),
      setWeightInput: jest.fn(),
      setNotesInput: jest.fn(),
      setRecentRecords: jest.fn(),
    };
    const { result } = renderHook(() => useWeightTrackerReloadAction(params));

    expect(result.current).toBe(resultShape);
    expect(createWeightTrackerReloadActionResult).toHaveBeenCalledWith({
      reloadWeightData: expect.any(Function),
    });

    const builtReloadWeightData = (
      createWeightTrackerReloadActionResult as jest.Mock
    ).mock.calls[0][0].reloadWeightData as () => void;

    act(() => {
      builtReloadWeightData();
    });

    expect(createLoadWeightDataAction).toHaveBeenCalledWith(
      expect.objectContaining({
        setTodayRecord: params.setTodayRecord,
        setWeightInput: params.setWeightInput,
        setNotesInput: params.setNotesInput,
        setRecentRecords: params.setRecentRecords,
      }),
    );
    expect(loadAction).toHaveBeenCalled();
  });
});
