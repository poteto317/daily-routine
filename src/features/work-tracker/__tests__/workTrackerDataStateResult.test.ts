import { createWorkTrackerDataStateResult } from "../page/workTrackerDataStateResult";
import type { WorkSession, WorkTemplate } from "../../../types/routine";

describe("createWorkTrackerDataStateResult", () => {
  it("data state の公開 shape を返す", () => {
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

    const result = createWorkTrackerDataStateResult({
      sessionsState,
      templatesState,
      initialState,
    });

    expect(result).toEqual({
      initialState,
      sessions: sessionsState.sessions,
      setSessions: sessionsState.setSessions,
      templates: templatesState.templates,
      setTemplates: templatesState.setTemplates,
    });
  });
});
