import { act, renderHook } from "@testing-library/react";

jest.mock("../page/workTrackerHookActions", () => ({
  createWorkTrackerResetFormHandler: jest.fn(),
}));

import { createWorkTrackerResetFormHandler } from "../page/workTrackerHookActions";
import { useWorkTrackerSessionResetAction } from "../page/useWorkTrackerSessionResetAction";

describe("useWorkTrackerSessionResetAction", () => {
  it("reset handler を組み立てて委譲する", () => {
    const resetAction = jest.fn();
    (createWorkTrackerResetFormHandler as jest.Mock).mockReturnValue(
      resetAction,
    );

    const params = createParams();
    const { result } = renderHook(() =>
      useWorkTrackerSessionResetAction(params),
    );

    act(() => {
      result.current();
    });

    expect(createWorkTrackerResetFormHandler).toHaveBeenCalledWith({
      setWorkName: params.setWorkName,
      setNotes: params.setNotes,
      setSelectedMood: params.setSelectedMood,
      setSelectedTemplate: params.setSelectedTemplate,
      setElapsedTime: params.setElapsedTime,
      setShowInputForm: params.setShowInputForm,
      setShowTemplateDropdown: params.setShowTemplateDropdown,
      clearStartTime: params.clearStartTime,
    });
    expect(resetAction).toHaveBeenCalled();
  });
});

const createParams = () => ({
  setWorkName: jest.fn(),
  setNotes: jest.fn(),
  setSelectedMood: jest.fn(),
  setSelectedTemplate: jest.fn(),
  setElapsedTime: jest.fn(),
  setShowInputForm: jest.fn(),
  setShowTemplateDropdown: jest.fn(),
  clearStartTime: jest.fn(),
});
