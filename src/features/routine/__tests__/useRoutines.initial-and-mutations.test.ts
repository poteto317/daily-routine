import "./useRoutines.test.setup";
import { renderHook, act } from "@testing-library/react";
import { useRoutines } from "../hooks/useRoutines";
import {
  getDailyProgress,
  getRoutines,
  mockRoutine,
  saveDailyProgress,
  saveDailyProgressSilently,
  saveRoutines,
  setupUseRoutinesDefaults,
} from "./useRoutines.test.setup";

describe("useRoutines initial and mutations", () => {
  beforeEach(setupUseRoutinesDefaults);

  it("初期化時に空配列とisLoaded=trueを返す", () => {
    const { result } = renderHook(() => useRoutines());
    expect(result.current.routines).toEqual([]);
    expect(result.current.isLoaded).toBe(true);
  });

  it("日付が変わっていた場合に完了状態をリセットする", () => {
    (getRoutines as jest.Mock).mockReturnValue([
      { ...mockRoutine, isCompleted: true },
    ]);
    (getDailyProgress as jest.Mock).mockReturnValue({
      date: "2024-01-14",
      completedRoutineIds: ["1"],
      lastResetTime: "2024-01-14T00:00:00.000Z",
    });
    const { result } = renderHook(() => useRoutines());
    expect(result.current.routines[0].isCompleted).toBe(false);
    expect(saveDailyProgressSilently).toHaveBeenCalled();
  });

  it("バックグラウンドから復帰時（同日）にルーティンデータが維持される", () => {
    (getRoutines as jest.Mock).mockReturnValue([mockRoutine]);
    (getDailyProgress as jest.Mock).mockReturnValue({
      date: "2024-01-15", // 今日と同じ日付
      completedRoutineIds: [],
      lastResetTime: "2024-01-15T00:00:00.000Z",
    });

    const { result } = renderHook(() => useRoutines());
    expect(result.current.routines).toHaveLength(1);

    // バックグラウンドから復帰 (visibilitychange イベント発火)
    act(() => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // 日付が変わっていないため完了状態はリセットされないが、
    // isRoutinePast() 再評価のために新しい配列参照が返されデータは保持される
    expect(result.current.routines).toHaveLength(1);
    expect(result.current.routines[0].id).toBe("1");
  });

  it("pageshowイベント（bfcache復元）でルーティンデータが維持される", () => {
    (getRoutines as jest.Mock).mockReturnValue([mockRoutine]);
    (getDailyProgress as jest.Mock).mockReturnValue({
      date: "2024-01-15",
      completedRoutineIds: [],
      lastResetTime: "2024-01-15T00:00:00.000Z",
    });

    const { result } = renderHook(() => useRoutines());
    expect(result.current.routines).toHaveLength(1);

    // bfcache からの復帰 (pageshow + persisted=true)
    act(() => {
      const event = new Event("pageshow") as PageTransitionEvent;
      Object.defineProperty(event, "persisted", { value: true });
      window.dispatchEvent(event);
    });

    expect(result.current.routines).toHaveLength(1);
    expect(result.current.routines[0].id).toBe("1");
  });

  it("routines-savedイベント受信時に別インスタンスのルーティンをlocalStorageから再読み込みする", async () => {
    // 初期は空
    (getRoutines as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useRoutines());
    expect(result.current.routines).toHaveLength(0);

    // 別インスタンス（PresetPage 等）がルーティンを保存したとみなし、
    // localStorage に新しいデータをセットしてカスタムイベントを発火
    (getRoutines as jest.Mock).mockReturnValue([mockRoutine]);
    await act(async () => {
      window.dispatchEvent(new CustomEvent("routines-saved"));
      // setTimeout(0) を使っているため次のマイクロタスクキューを待つ
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.routines).toHaveLength(1);
    expect(result.current.routines[0].id).toBe("1");
  });

  it("add/update/delete/toggleが反映される", () => {
    (getRoutines as jest.Mock).mockReturnValue([mockRoutine]);
    const { result } = renderHook(() => useRoutines());

    act(() => {
      result.current.addRoutine({
        title: "New",
        startTime: "10:00",
        duration: 30,
        category: "work",
        daysOfWeek: [1],
        isCompleted: false,
        notificationMinutes: 15,
        sortOrder: 0,
      });
    });
    expect(result.current.routines.some((r) => r.title === "New")).toBe(true);

    act(() => {
      result.current.updateRoutine("1", { title: "Updated" });
    });
    expect(result.current.routines.find((r) => r.id === "1")?.title).toBe(
      "Updated",
    );

    act(() => {
      result.current.toggleComplete("1");
    });
    expect(saveDailyProgress).toHaveBeenCalled();

    act(() => {
      result.current.deleteRoutine("1");
    });
    expect(result.current.routines.find((r) => r.id === "1")).toBeUndefined();
    expect(saveRoutines).toHaveBeenCalled();
  });
});
