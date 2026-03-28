import { renderHook } from "@testing-library/react";
import { useWorkTrackerSessionActions } from "../page/useWorkTrackerSessionActions";

jest.mock("../page/useWorkTrackerSessionResetAction", () => ({
  useWorkTrackerSessionResetAction: jest.fn(() => jest.fn()),
}));

jest.mock("../page/useWorkTrackerSessionCommandActions", () => ({
  useWorkTrackerSessionCommandActions: jest.fn(() => ({
    handleCancelSession: jest.fn(),
    handleDeleteSession: jest.fn(),
    handleSaveSession: jest.fn(),
  })),
}));

jest.mock("../page/workTrackerSessionActionsResult", () => ({
  createWorkTrackerSessionActionsResult: jest.fn(),
}));

import { useWorkTrackerSessionCommandActions } from "../page/useWorkTrackerSessionCommandActions";
import { useWorkTrackerSessionResetAction } from "../page/useWorkTrackerSessionResetAction";
import { createWorkTrackerSessionActionsResult } from "../page/workTrackerSessionActionsResult";

describe("useWorkTrackerSessionActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reset hook と command hook を compose する", () => {
    const params = createParams();
    const resultShape = {
      handleCancelSession: jest.fn(),
      handleDeleteSession: jest.fn(),
      handleSaveSession: jest.fn(),
      resetForm: jest.fn(),
      composed: true,
    };
    (createWorkTrackerSessionActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() => useWorkTrackerSessionActions(params));

    expect(useWorkTrackerSessionResetAction).toHaveBeenCalledWith({
      clearStartTime: params.clearStartTime,
      setElapsedTime: params.setElapsedTime,
      setNotes: params.setNotes,
      setSelectedMood: params.setSelectedMood,
      setSelectedTemplate: params.setSelectedTemplate,
      setShowInputForm: params.setShowInputForm,
      setShowTemplateDropdown: params.setShowTemplateDropdown,
      setWorkName: params.setWorkName,
    });
    expect(useWorkTrackerSessionCommandActions).toHaveBeenCalledWith({
      workName: params.workName,
      selectedMood: params.selectedMood,
      elapsedTime: params.elapsedTime,
      notes: params.notes,
      getStartTime: params.getStartTime,
      setSessions: params.setSessions,
      setTemplates: params.setTemplates,
      resetForm: (useWorkTrackerSessionResetAction as jest.Mock).mock.results[0]
        .value,
    });
    expect(createWorkTrackerSessionActionsResult).toHaveBeenCalledWith({
      ...(useWorkTrackerSessionCommandActions as jest.Mock).mock.results[0]
        .value,
      resetForm: (useWorkTrackerSessionResetAction as jest.Mock).mock.results[0]
        .value,
    });
    expect(result.current).toBe(resultShape);
  });
});

const createParams = () => ({
  workName: "設計",
  selectedMood: "good" as const,
  elapsedTime: 120,
  notes: "メモ",
  getStartTime: jest.fn(() => new Date("2026-03-07T09:00:00.000Z")),
  setSessions: jest.fn(),
  setTemplates: jest.fn(),
  setWorkName: jest.fn(),
  setNotes: jest.fn(),
  setSelectedMood: jest.fn(),
  setSelectedTemplate: jest.fn(),
  setElapsedTime: jest.fn(),
  setShowInputForm: jest.fn(),
  setShowTemplateDropdown: jest.fn(),
  clearStartTime: jest.fn(),
});
