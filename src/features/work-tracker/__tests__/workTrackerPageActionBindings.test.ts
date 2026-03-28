import { createWorkTrackerPageActionBindings } from "../page/workTrackerPageActionBindings";

describe("workTrackerPageActionBindings", () => {
  it("session action 用の依存を束ねる", () => {
    const bindings = createWorkTrackerPageActionBindings({
      workName: "設計",
      selectedMood: "good",
      elapsedTime: 3600,
      notes: "メモ",
      getStartTime: jest.fn(),
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

    expect(bindings).toEqual(
      expect.objectContaining({
        workName: "設計",
        selectedMood: "good",
        elapsedTime: 3600,
        notes: "メモ",
      }),
    );
  });
});
