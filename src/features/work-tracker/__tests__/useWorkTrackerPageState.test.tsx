import { renderHook } from "@testing-library/react";
import { useWorkTrackerPageState } from "../page/useWorkTrackerPageState";

jest.mock("../page/workTrackerPageActionBindings", () => ({
  createWorkTrackerPageActionBindings: jest.fn(),
}));

jest.mock("../page/workTrackerPageStateResult", () => ({
  createWorkTrackerPageStateResult: jest.fn(),
}));

jest.mock("../page/useWorkTrackerDataState", () => ({
  useWorkTrackerDataState: jest.fn(),
}));

jest.mock("../page/useWorkTrackerRunState", () => ({
  useWorkTrackerRunState: jest.fn(),
}));

jest.mock("../page/useWorkTrackerSessionActions", () => ({
  useWorkTrackerSessionActions: jest.fn(),
}));

jest.mock("../page/useWorkTrackerSessionFormState", () => ({
  useWorkTrackerSessionFormState: jest.fn(),
}));

import { createWorkTrackerPageActionBindings } from "../page/workTrackerPageActionBindings";
import { createWorkTrackerPageStateResult } from "../page/workTrackerPageStateResult";
import { useWorkTrackerDataState } from "../page/useWorkTrackerDataState";
import { useWorkTrackerRunState } from "../page/useWorkTrackerRunState";
import { useWorkTrackerSessionActions } from "../page/useWorkTrackerSessionActions";
import { useWorkTrackerSessionFormState } from "../page/useWorkTrackerSessionFormState";

describe("useWorkTrackerPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWorkTrackerDataState as jest.Mock).mockReturnValue({
      initialState: { isRunning: false, elapsedTime: 0 },
      sessions: [],
      setSessions: jest.fn(),
      templates: [],
      setTemplates: jest.fn(),
    });
    (useWorkTrackerSessionFormState as jest.Mock).mockReturnValue({
      notes: "",
      selectedMood: "normal",
      selectedTemplate: null,
      setNotes: jest.fn(),
      setSelectedMood: jest.fn(),
      setSelectedTemplate: jest.fn(),
      setShowInputForm: jest.fn(),
      setShowTemplateDropdown: jest.fn(),
      setWorkName: jest.fn(),
      showInputForm: false,
      showTemplateDropdown: false,
      workName: "",
    });
    (useWorkTrackerRunState as jest.Mock).mockReturnValue({
      clearStartTime: jest.fn(),
      elapsedTime: 0,
      getStartTime: jest.fn(),
      isRunning: false,
      setElapsedTime: jest.fn(),
      startTimer: jest.fn(),
      stopTimer: jest.fn(),
    });
    (createWorkTrackerPageActionBindings as jest.Mock).mockReturnValue({
      bound: true,
    });
    (useWorkTrackerSessionActions as jest.Mock).mockReturnValue({
      handleCancelSession: jest.fn(),
      handleDeleteSession: jest.fn(),
      handleSaveSession: jest.fn(),
    });
    (createWorkTrackerPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("data/form/run/actions/result を compose する", () => {
    const { result } = renderHook(() => useWorkTrackerPageState());

    expect(useWorkTrackerSessionFormState).toHaveBeenCalledWith(
      expect.objectContaining({
        initialState: expect.objectContaining({
          isRunning: false,
          elapsedTime: 0,
        }),
      }),
    );
    expect(useWorkTrackerRunState).toHaveBeenCalledWith(
      expect.objectContaining({
        initialIsRunning: false,
        initialElapsedTime: 0,
        setShowInputForm: expect.any(Function),
      }),
    );
    expect(createWorkTrackerPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        workName: "",
        selectedMood: "normal",
        elapsedTime: 0,
        notes: "",
      }),
    );
    expect(useWorkTrackerSessionActions).toHaveBeenCalledWith({ bound: true });
    expect(createWorkTrackerPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        sessions: [],
        templates: [],
        isRunning: false,
        elapsedTime: 0,
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });
});
