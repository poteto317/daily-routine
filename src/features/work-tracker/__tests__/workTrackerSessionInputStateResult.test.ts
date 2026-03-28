import { createWorkTrackerSessionInputStateResult } from "../page/workTrackerSessionInputStateResult";

describe("createWorkTrackerSessionInputStateResult", () => {
  it("input state の公開 shape を返す", () => {
    const template = {
      id: "t1",
      name: "設計",
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };
    const setWorkName = jest.fn();
    const setNotes = jest.fn();
    const setSelectedMood = jest.fn();
    const setSelectedTemplate = jest.fn();

    expect(
      createWorkTrackerSessionInputStateResult({
        workName: "設計",
        setWorkName,
        notes: "メモ",
        setNotes,
        selectedMood: "great",
        setSelectedMood,
        selectedTemplate: template,
        setSelectedTemplate,
      }),
    ).toEqual({
      workName: "設計",
      setWorkName,
      notes: "メモ",
      setNotes,
      selectedMood: "great",
      setSelectedMood,
      selectedTemplate: template,
      setSelectedTemplate,
    });
  });
});
