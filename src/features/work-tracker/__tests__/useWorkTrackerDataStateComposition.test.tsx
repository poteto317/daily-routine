import { renderHook } from "@testing-library/react";
import type { WorkSession, WorkTemplate } from "../../../types/routine";

jest.mock("../page/workTrackerDataStateResult", () => ({
  createWorkTrackerDataStateResult: jest.fn(),
}));

jest.mock("../page/useWorkTrackerSessionsState", () => ({
  useWorkTrackerSessionsState: jest.fn(() => ({
    sessions: [{ id: "s1" }],
    setSessions: jest.fn(),
  })),
}));

jest.mock("../page/useWorkTrackerTemplatesState", () => ({
  useWorkTrackerTemplatesState: jest.fn(() => ({
    templates: [{ id: "t1" }],
    setTemplates: jest.fn(),
  })),
}));

jest.mock("../page/useWorkTrackerInitialState", () => ({
  useWorkTrackerInitialState: jest.fn(() => ({
    sessions: [{ id: "s1" }],
    templates: [{ id: "t1" }],
    isRunning: false,
    elapsedTime: 0,
    showInputForm: false,
    showTemplateDropdown: false,
    workName: "",
    notes: "",
    selectedMood: "normal",
    selectedTemplate: null,
  })),
}));

import { useWorkTrackerDataState } from "../page/useWorkTrackerDataState";
import { useWorkTrackerInitialState } from "../page/useWorkTrackerInitialState";
import { useWorkTrackerSessionsState } from "../page/useWorkTrackerSessionsState";
import { useWorkTrackerTemplatesState } from "../page/useWorkTrackerTemplatesState";
import { createWorkTrackerDataStateResult } from "../page/workTrackerDataStateResult";

describe("useWorkTrackerDataState composition", () => {
  it("sessions/templates state hook を compose して initialState を作る", () => {
    const sessions: WorkSession[] = [
      {
        id: "s1",
        workTemplateId: "t1",
        workName: "Deep Work",
        mood: "normal",
        startTime: "2026-03-07T09:00:00.000Z",
        createdAt: "2026-03-07T09:00:00.000Z",
      },
    ];
    const templates: WorkTemplate[] = [
      {
        id: "t1",
        name: "Morning Focus",
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ];
    const sessionsState = {
      sessions,
      setSessions: jest.fn(),
    };
    const templatesState = {
      templates,
      setTemplates: jest.fn(),
    };
    const initialState = {
      sessions,
      templates,
      isRunning: false,
      elapsedTime: 0,
      showInputForm: false,
      showTemplateDropdown: false,
      workName: "",
      notes: "",
      selectedMood: "normal" as const,
      selectedTemplate: null,
    };
    (useWorkTrackerSessionsState as jest.Mock).mockReturnValue(sessionsState);
    (useWorkTrackerTemplatesState as jest.Mock).mockReturnValue(templatesState);
    (useWorkTrackerInitialState as jest.Mock).mockReturnValue(initialState);
    (createWorkTrackerDataStateResult as jest.Mock).mockReturnValue({
      initialState,
      sessions: sessionsState.sessions,
      setSessions: sessionsState.setSessions,
      templates: templatesState.templates,
      setTemplates: templatesState.setTemplates,
    });

    const { result } = renderHook(() => useWorkTrackerDataState());

    expect(useWorkTrackerSessionsState).toHaveBeenCalled();
    expect(useWorkTrackerTemplatesState).toHaveBeenCalled();
    expect(useWorkTrackerInitialState).toHaveBeenCalledWith({
      sessions,
      templates,
    });
    expect(createWorkTrackerDataStateResult).toHaveBeenCalledWith({
      sessionsState,
      templatesState,
      initialState,
    });
    expect(result.current).toEqual({
      initialState,
      sessions,
      setSessions: expect.any(Function),
      templates,
      setTemplates: expect.any(Function),
    });
  });
});
