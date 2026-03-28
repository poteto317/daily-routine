import { createWorkTrackerSessionFormStateResult } from "../page/workTrackerSessionFormStateResult";

describe("workTrackerSessionFormStateResult", () => {
  it("session form state の公開 shape を組み立てる", () => {
    const setShowInputForm = jest.fn();
    const setShowTemplateDropdown = jest.fn();
    const setWorkName = jest.fn();
    const setNotes = jest.fn();
    const setSelectedMood = jest.fn();
    const setSelectedTemplate = jest.fn();
    const template = {
      id: "t1",
      name: "設計",
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
      lastUsedAt: "2026-03-07T00:00:00.000Z",
    };

    expect(
      createWorkTrackerSessionFormStateResult({
        showInputForm: true,
        showTemplateDropdown: false,
        setShowInputForm,
        setShowTemplateDropdown,
        workName: "設計",
        notes: "メモ",
        selectedMood: "good",
        selectedTemplate: template,
        setWorkName,
        setNotes,
        setSelectedMood,
        setSelectedTemplate,
      }),
    ).toEqual({
      showInputForm: true,
      showTemplateDropdown: false,
      setShowInputForm,
      setShowTemplateDropdown,
      workName: "設計",
      notes: "メモ",
      selectedMood: "good",
      selectedTemplate: template,
      setWorkName,
      setNotes,
      setSelectedMood,
      setSelectedTemplate,
    });
  });
});
