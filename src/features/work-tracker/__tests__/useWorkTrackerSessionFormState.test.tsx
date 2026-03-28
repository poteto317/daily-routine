import { renderHook } from "@testing-library/react";
import { useWorkTrackerSessionFormState } from "../page/useWorkTrackerSessionFormState";

jest.mock("../page/workTrackerSessionFormStateResult", () => ({
  createWorkTrackerSessionFormStateResult: jest.fn(),
}));

jest.mock("../page/useWorkTrackerSessionInputState", () => ({
  useWorkTrackerSessionInputState: jest.fn(),
}));

jest.mock("../page/useWorkTrackerSessionVisibilityState", () => ({
  useWorkTrackerSessionVisibilityState: jest.fn(),
}));

import { useWorkTrackerSessionInputState } from "../page/useWorkTrackerSessionInputState";
import { useWorkTrackerSessionVisibilityState } from "../page/useWorkTrackerSessionVisibilityState";
import { createWorkTrackerSessionFormStateResult } from "../page/workTrackerSessionFormStateResult";

describe("useWorkTrackerSessionFormState", () => {
  const initialState = {
    showInputForm: false,
    showTemplateDropdown: false,
    workName: "",
    notes: "",
    selectedMood: "normal" as const,
    selectedTemplate: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWorkTrackerSessionVisibilityState as jest.Mock).mockReturnValue({
      showInputForm: false,
      showTemplateDropdown: false,
      setShowInputForm: jest.fn(),
      setShowTemplateDropdown: jest.fn(),
    });
    (useWorkTrackerSessionInputState as jest.Mock).mockReturnValue({
      workName: "",
      notes: "",
      selectedMood: "normal",
      selectedTemplate: null,
      setWorkName: jest.fn(),
      setNotes: jest.fn(),
      setSelectedMood: jest.fn(),
      setSelectedTemplate: jest.fn(),
    });
    (createWorkTrackerSessionFormStateResult as jest.Mock).mockImplementation(
      (params) => params,
    );
  });

  it("visibility/input state hooks と result builder を compose する", () => {
    const { result } = renderHook(() =>
      useWorkTrackerSessionFormState({
        initialState,
      }),
    );

    expect(useWorkTrackerSessionVisibilityState).toHaveBeenCalledWith({
      initialShowInputForm: false,
      initialShowTemplateDropdown: false,
    });
    expect(useWorkTrackerSessionInputState).toHaveBeenCalledWith({
      initialWorkName: "",
      initialNotes: "",
      initialSelectedMood: "normal",
      initialSelectedTemplate: null,
    });
    expect(createWorkTrackerSessionFormStateResult).toHaveBeenCalledWith({
      showInputForm: false,
      showTemplateDropdown: false,
      setShowInputForm: expect.any(Function),
      setShowTemplateDropdown: expect.any(Function),
      workName: "",
      notes: "",
      selectedMood: "normal",
      selectedTemplate: null,
      setWorkName: expect.any(Function),
      setNotes: expect.any(Function),
      setSelectedMood: expect.any(Function),
      setSelectedTemplate: expect.any(Function),
    });
    expect(result.current).toEqual({
      showInputForm: false,
      showTemplateDropdown: false,
      setShowInputForm: expect.any(Function),
      setShowTemplateDropdown: expect.any(Function),
      workName: "",
      notes: "",
      selectedMood: "normal",
      selectedTemplate: null,
      setWorkName: expect.any(Function),
      setNotes: expect.any(Function),
      setSelectedMood: expect.any(Function),
      setSelectedTemplate: expect.any(Function),
    });
  });

  it("初期状態を各 state hook に渡す", () => {
    renderHook(() =>
      useWorkTrackerSessionFormState({
        initialState: {
          ...initialState,
          showInputForm: true,
          showTemplateDropdown: true,
          workName: "初期タスク",
          notes: "初期メモ",
          selectedMood: "good",
        },
      }),
    );

    expect(useWorkTrackerSessionVisibilityState).toHaveBeenLastCalledWith({
      initialShowInputForm: true,
      initialShowTemplateDropdown: true,
    });
    expect(useWorkTrackerSessionInputState).toHaveBeenLastCalledWith({
      initialWorkName: "初期タスク",
      initialNotes: "初期メモ",
      initialSelectedMood: "good",
      initialSelectedTemplate: null,
    });
  });
});
