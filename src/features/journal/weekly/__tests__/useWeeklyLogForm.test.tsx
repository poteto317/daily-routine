import { act, renderHook } from "@testing-library/react";
import { useWeeklyLogForm } from "../useWeeklyLogForm";

describe("useWeeklyLogForm", () => {
  it("最初は閉じていて入力は空", () => {
    const { result } = renderHook(() => useWeeklyLogForm());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.contentInput).toBe("");
    expect(result.current.editingWeekStart).toBeNull();
  });

  it("open で初期本文を入れて開く", () => {
    const { result } = renderHook(() => useWeeklyLogForm());
    act(() => result.current.open("2026-11-02", "既存の本文"));
    expect(result.current.isEditing).toBe(true);
    expect(result.current.editingWeekStart).toBe("2026-11-02");
    expect(result.current.contentInput).toBe("既存の本文");
  });

  it("changeContent で入力を更新する", () => {
    const { result } = renderHook(() => useWeeklyLogForm());
    act(() => result.current.open("2026-11-02", ""));
    act(() => result.current.changeContent("新しい本文"));
    expect(result.current.contentInput).toBe("新しい本文");
  });

  it("close で閉じて入力を空に戻す", () => {
    const { result } = renderHook(() => useWeeklyLogForm());
    act(() => result.current.open("2026-11-02", "本文"));
    act(() => result.current.close());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.editingWeekStart).toBeNull();
    expect(result.current.contentInput).toBe("");
  });
});
