import { act, renderHook } from "@testing-library/react";
import { useWorkoutRecordFormError } from "../page/useWorkoutRecordFormError";

describe("useWorkoutRecordFormError", () => {
  it("初期値はnull", () => {
    const { result } = renderHook(() => useWorkoutRecordFormError());

    expect(result.current.error).toBeNull();
  });

  it("setErrorでエラーメッセージを設定できる", () => {
    const { result } = renderHook(() => useWorkoutRecordFormError());

    act(() => result.current.setError("エラー"));
    expect(result.current.error).toBe("エラー");
  });

  it("setError(null)でエラーをクリアできる", () => {
    const { result } = renderHook(() => useWorkoutRecordFormError());

    act(() => result.current.setError("エラー"));
    act(() => result.current.setError(null));

    expect(result.current.error).toBeNull();
  });
});
