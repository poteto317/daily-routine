import { act, renderHook } from "@testing-library/react";
import { createWorkTrackerSessionInputStateResult } from "../page/workTrackerSessionInputStateResult";
import { useWorkTrackerSessionInputState } from "../page/useWorkTrackerSessionInputState";

jest.mock("../page/workTrackerSessionInputStateResult", () => ({
  createWorkTrackerSessionInputStateResult: jest.fn(),
}));

describe("useWorkTrackerSessionInputState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createWorkTrackerSessionInputStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("初期値と入力変更を管理し result helper に委譲する", () => {
    const template = {
      id: "t1",
      name: "設計",
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };
    const { result } = renderHook(() =>
      useWorkTrackerSessionInputState({
        initialWorkName: "",
        initialNotes: "",
        initialSelectedMood: "normal",
        initialSelectedTemplate: null,
      }),
    );

    expect(createWorkTrackerSessionInputStateResult).toHaveBeenCalledWith({
      workName: "",
      setWorkName: expect.any(Function),
      notes: "",
      setNotes: expect.any(Function),
      selectedMood: "normal",
      setSelectedMood: expect.any(Function),
      selectedTemplate: null,
      setSelectedTemplate: expect.any(Function),
    });

    expect(result.current.workName).toBe("");
    expect(result.current.notes).toBe("");
    expect(result.current.selectedMood).toBe("normal");
    expect(result.current.selectedTemplate).toBeNull();

    act(() => {
      result.current.setWorkName("設計");
      result.current.setNotes("メモ");
      result.current.setSelectedMood("great");
      result.current.setSelectedTemplate(template);
    });

    expect(result.current.workName).toBe("設計");
    expect(result.current.notes).toBe("メモ");
    expect(result.current.selectedMood).toBe("great");
    expect(result.current.selectedTemplate).toEqual(template);
    expect(createWorkTrackerSessionInputStateResult).toHaveBeenLastCalledWith({
      workName: "設計",
      setWorkName: expect.any(Function),
      notes: "メモ",
      setNotes: expect.any(Function),
      selectedMood: "great",
      setSelectedMood: expect.any(Function),
      selectedTemplate: template,
      setSelectedTemplate: expect.any(Function),
    });
  });
});
