import type { Routine } from "@/types/routine";
import { isRoutinePast } from "../helpersPresentation";
import { shouldShowRoutineToday } from "../storageVisibility";

/** 指定した曜日だけのルーティン */
const routineOn = (day: number, startTime = "06:00"): Routine =>
  ({
    id: `r-${day}`,
    title: "テスト",
    daysOfWeek: [day],
    startTime,
    category: "life",
  }) as unknown as Routine;

describe("「今日」の曜日判定", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("日本時間の朝でも当日の曜日で表示を判定する", () => {
    // 2026-08-13(木) 07:00 JST = 2026-08-12(水) 22:00 UTC
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(shouldShowRoutineToday(routineOn(4))).toBe(true);
    expect(shouldShowRoutineToday(routineOn(3))).toBe(false);
  });

  it("日本時間の夜も当日の曜日で判定する", () => {
    // 2026-08-13(木) 20:00 JST = 2026-08-13 11:00 UTC
    jest.useFakeTimers().setSystemTime(new Date("2026-08-13T11:00:00Z"));

    expect(shouldShowRoutineToday(routineOn(4))).toBe(true);
  });

  it("経過判定も当日の曜日と JST の時刻で行う", () => {
    // 木曜 07:00 JST。06:00 開始のルーティンは過ぎている
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(isRoutinePast(routineOn(4, "06:00"))).toBe(true);
    expect(isRoutinePast(routineOn(4, "08:00"))).toBe(false);
  });

  it("別の曜日のルーティンは経過扱いにしない", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(isRoutinePast(routineOn(3, "06:00"))).toBe(false);
  });
});
