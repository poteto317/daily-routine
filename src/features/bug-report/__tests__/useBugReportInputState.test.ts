import { act, renderHook } from "@testing-library/react";
import { useBugReportInputState } from "../hooks/useBugReportInputState";

describe("useBugReportInputState", () => {
  it("初期値がすべて空文字である", () => {
    const { result } = renderHook(() => useBugReportInputState());
    expect(result.current.description).toBe("");
    expect(result.current.stepsToReproduce).toBe("");
  });

  it("setDescription で description を更新できる", () => {
    const { result } = renderHook(() => useBugReportInputState());
    act(() => {
      result.current.setDescription("テスト説明");
    });
    expect(result.current.description).toBe("テスト説明");
  });

  it("setStepsToReproduce で stepsToReproduce を更新できる", () => {
    const { result } = renderHook(() => useBugReportInputState());
    act(() => {
      result.current.setStepsToReproduce("1. 再現手順");
    });
    expect(result.current.stepsToReproduce).toBe("1. 再現手順");
  });

  it("resetInput ですべてのフィールドが空文字にリセットされる", () => {
    const { result } = renderHook(() => useBugReportInputState());
    act(() => {
      result.current.setDescription("説明");
      result.current.setStepsToReproduce("手順");
    });
    act(() => {
      result.current.resetInput();
    });
    expect(result.current.description).toBe("");
    expect(result.current.stepsToReproduce).toBe("");
  });

  it("resetInput は各フィールドを独立してリセットする", () => {
    const { result } = renderHook(() => useBugReportInputState());
    act(() => {
      result.current.setDescription("before");
    });
    act(() => {
      result.current.resetInput();
    });
    expect(result.current.description).toBe("");
  });

  it("resetInput は再レンダー後も同じ参照を返す（useCallback による安定化）", () => {
    const { result, rerender } = renderHook(() => useBugReportInputState());
    const first = result.current.resetInput;
    rerender();
    expect(result.current.resetInput).toBe(first);
  });
});
