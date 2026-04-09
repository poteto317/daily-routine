import { act, renderHook } from "@testing-library/react";
import type { Routine } from "@/types/routine";
import { useRoutineLastUpdateTracker } from "../useRoutineLastUpdateTracker";

const makeRoutine = (id: string): Routine =>
  ({
    id,
    title: id,
    startTime: "09:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1],
    isCompleted: false,
    sortOrder: 0,
  }) as Routine;

describe("useRoutineLastUpdateTracker", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("マウント後に useEffect が実行されると現在時刻で更新される", () => {
    jest.setSystemTime(1000);

    const { result } = renderHook(() =>
      useRoutineLastUpdateTracker([makeRoutine("a")]),
    );

    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current.current).toBe(1000);
  });

  it("routines 配列が変わると lastUpdateAt が更新される", () => {
    jest.setSystemTime(2000);

    const { rerender, result } = renderHook(
      ({ routines }: { routines: Routine[] }) =>
        useRoutineLastUpdateTracker(routines),
      { initialProps: { routines: [makeRoutine("a")] } },
    );

    act(() => jest.advanceTimersByTime(0));
    expect(result.current.current).toBe(2000);

    jest.setSystemTime(5000);
    act(() => {
      rerender({ routines: [makeRoutine("a"), makeRoutine("b")] });
      jest.advanceTimersByTime(0);
    });

    expect(result.current.current).toBe(5000);
  });

  it("routines 配列が同じ参照のままなら lastUpdateAt は更新されない", () => {
    jest.setSystemTime(1000);
    const routines = [makeRoutine("a")];

    const { rerender, result } = renderHook(
      ({ r }: { r: Routine[] }) => useRoutineLastUpdateTracker(r),
      { initialProps: { r: routines } },
    );

    act(() => jest.advanceTimersByTime(0));
    const firstTime = result.current.current;

    jest.setSystemTime(9000);
    act(() => {
      rerender({ r: routines }); // 同じ参照
      jest.advanceTimersByTime(0);
    });

    expect(result.current.current).toBe(firstTime);
  });

  it("返す ref オブジェクトは再レンダー間で同一参照を保つ", () => {
    const { rerender, result } = renderHook(
      ({ routines }: { routines: Routine[] }) =>
        useRoutineLastUpdateTracker(routines),
      { initialProps: { routines: [makeRoutine("a")] } },
    );

    const firstRef = result.current;
    rerender({ routines: [makeRoutine("a"), makeRoutine("b")] });

    expect(result.current).toBe(firstRef);
  });

  it("要素参照が全て同一の配列コピー（[...previous] 相当）は lastUpdateAt を更新しない", () => {
    // refreshRoutineState が日付未変更時に返す [...previous] を模倣するテスト
    jest.setSystemTime(1000);
    const r = makeRoutine("a");
    const initialRoutines = [r];

    const { rerender, result } = renderHook(
      ({ routines }: { routines: Routine[] }) =>
        useRoutineLastUpdateTracker(routines),
      { initialProps: { routines: initialRoutines } },
    );

    act(() => jest.advanceTimersByTime(0));
    expect(result.current.current).toBe(1000); // 初期ロードはデータ変化

    jest.setSystemTime(9000);
    // 新しい配列インスタンスだが要素の参照は同一（= [...previous] と等価）
    act(() => {
      rerender({ routines: [r] });
      jest.advanceTimersByTime(0);
    });

    expect(result.current.current).toBe(1000); // 要素変化なし → 更新されない
  });

  it("同じ長さでも要素が置換されていれば lastUpdateAt を更新する", () => {
    jest.setSystemTime(1000);
    const r = makeRoutine("a");

    const { rerender, result } = renderHook(
      ({ routines }: { routines: Routine[] }) =>
        useRoutineLastUpdateTracker(routines),
      { initialProps: { routines: [r] } },
    );

    act(() => jest.advanceTimersByTime(0));
    expect(result.current.current).toBe(1000);

    jest.setSystemTime(5000);
    // isCompleted が変わった別オブジェクト（要素参照が変化）
    const rUpdated = { ...r, isCompleted: true } as Routine;
    act(() => {
      rerender({ routines: [rUpdated] });
      jest.advanceTimersByTime(0);
    });

    expect(result.current.current).toBe(5000);
  });
});
