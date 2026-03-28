import { act, renderHook } from "@testing-library/react";
import { createWorkTrackerSessionVisibilityStateResult } from "../page/workTrackerSessionVisibilityStateResult";
import { useWorkTrackerSessionVisibilityState } from "../page/useWorkTrackerSessionVisibilityState";

jest.mock("../page/workTrackerSessionVisibilityStateResult", () => ({
  createWorkTrackerSessionVisibilityStateResult: jest.fn(),
}));

describe("useWorkTrackerSessionVisibilityState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      createWorkTrackerSessionVisibilityStateResult as jest.Mock
    ).mockImplementation((args) => args);
  });

  it("初期値と表示状態変更を管理し result helper に委譲する", () => {
    const { result } = renderHook(() =>
      useWorkTrackerSessionVisibilityState({
        initialShowInputForm: false,
        initialShowTemplateDropdown: false,
      }),
    );

    expect(createWorkTrackerSessionVisibilityStateResult).toHaveBeenCalledWith({
      setShowInputForm: expect.any(Function),
      setShowTemplateDropdown: expect.any(Function),
      showInputForm: false,
      showTemplateDropdown: false,
    });

    expect(result.current.showInputForm).toBe(false);
    expect(result.current.showTemplateDropdown).toBe(false);

    act(() => {
      result.current.setShowInputForm(true);
      result.current.setShowTemplateDropdown(true);
    });

    expect(result.current.showInputForm).toBe(true);
    expect(result.current.showTemplateDropdown).toBe(true);
    expect(
      createWorkTrackerSessionVisibilityStateResult,
    ).toHaveBeenLastCalledWith({
      setShowInputForm: expect.any(Function),
      setShowTemplateDropdown: expect.any(Function),
      showInputForm: true,
      showTemplateDropdown: true,
    });
  });
});
