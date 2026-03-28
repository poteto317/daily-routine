import { createWorkTrackerPageStateResult } from "../page/workTrackerPageStateResult";

describe("workTrackerPageStateResult", () => {
  it("work tracker page の result を組み立てる", () => {
    const setWorkName = jest.fn();
    const setNotes = jest.fn();
    const setSelectedMood = jest.fn();
    const setSelectedTemplate = jest.fn();
    const setShowTemplateDropdown = jest.fn();
    const setShowInputForm = jest.fn();
    const startTimer = jest.fn();
    const stopTimer = jest.fn();
    const handleSaveSession = jest.fn();
    const handleCancelSession = jest.fn();
    const handleDeleteSession = jest.fn();
    const session = {
      id: "s1",
      workTemplateId: "t1",
      workName: "設計",
      mood: "good" as const,
      startTime: "2026-03-07T09:00:00.000Z",
      endTime: "2026-03-07T10:00:00.000Z",
      duration: 3600,
      createdAt: "2026-03-07T10:00:00.000Z",
    };
    const template = {
      id: "t1",
      name: "設計",
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
      lastUsedAt: "2026-03-07T00:00:00.000Z",
    };

    expect(
      createWorkTrackerPageStateResult({
        sessions: [session],
        templates: [template],
        isRunning: false,
        elapsedTime: 3600,
        showInputForm: true,
        showTemplateDropdown: false,
        workName: "設計",
        notes: "メモ",
        selectedMood: "good",
        selectedTemplate: template,
        setWorkName,
        setNotes,
        setSelectedMood,
        setSelectedTemplate,
        setShowTemplateDropdown,
        setShowInputForm,
        startTimer,
        stopTimer,
        handleSaveSession,
        handleCancelSession,
        handleDeleteSession,
      }),
    ).toEqual({
      sessions: [session],
      templates: [template],
      isRunning: false,
      elapsedTime: 3600,
      showInputForm: true,
      showTemplateDropdown: false,
      workName: "設計",
      notes: "メモ",
      selectedMood: "good",
      selectedTemplate: template,
      setWorkName,
      setNotes,
      setSelectedMood,
      setSelectedTemplate,
      setShowTemplateDropdown,
      setShowInputForm,
      startTimer,
      stopTimer,
      handleSaveSession,
      handleCancelSession,
      handleDeleteSession,
    });
  });
});
