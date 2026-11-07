import { renderHook } from "@testing-library/react";

jest.mock("../page/useWeightTrackerReloadAction", () => ({
  useWeightTrackerReloadAction: jest.fn(),
}));

jest.mock("../page/useWeightTrackerMutationActions", () => ({
  useWeightTrackerMutationActions: jest.fn(),
}));

jest.mock("../page/weightTrackerActionsResult", () => ({
  createWeightTrackerActionsResult: jest.fn(),
}));

import { useWeightTrackerActions } from "../page/useWeightTrackerActions";
import { useWeightTrackerMutationActions } from "../page/useWeightTrackerMutationActions";
import { useWeightTrackerReloadAction } from "../page/useWeightTrackerReloadAction";
import { createWeightTrackerActionsResult } from "../page/weightTrackerActionsResult";

describe("useWeightTrackerActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reload hook と mutation hook を compose して委譲する", () => {
    const loadAction = jest.fn();
    const saveAction = jest.fn();
    const deleteAction = jest.fn();
    const resultShape = { composed: true };
    (useWeightTrackerReloadAction as jest.Mock).mockReturnValue({
      reloadWeightData: loadAction,
    });
    (useWeightTrackerMutationActions as jest.Mock).mockReturnValue({
      handleSaveWeight: saveAction,
      handleDeleteRecord: deleteAction,
    });
    (createWeightTrackerActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      weightInput: "69.5",
      notesInput: "memo",
      setTodayRecord: jest.fn(),
      setWeightInput: jest.fn(),
      setNotesInput: jest.fn(),
      setShowForm: jest.fn(),
      setRecentRecords: jest.fn(),
    };
    const { result } = renderHook(() => useWeightTrackerActions(params));

    expect(useWeightTrackerReloadAction).toHaveBeenCalledWith({
      setTodayRecord: params.setTodayRecord,
      setWeightInput: params.setWeightInput,
      setNotesInput: params.setNotesInput,
      setRecentRecords: params.setRecentRecords,
    });
    expect(useWeightTrackerMutationActions).toHaveBeenCalledWith(
      expect.objectContaining({
        weightInput: "69.5",
        notesInput: "memo",
        setShowForm: params.setShowForm,
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は渡さない
    expect(
      (useWeightTrackerMutationActions as jest.Mock).mock.calls[0][0],
    ).not.toHaveProperty("today");
    expect(createWeightTrackerActionsResult).toHaveBeenCalledWith({
      handleDeleteRecord: deleteAction,
      handleSaveWeight: saveAction,
      reloadWeightData: loadAction,
    });
    expect(result.current).toBe(resultShape);
  });
});
