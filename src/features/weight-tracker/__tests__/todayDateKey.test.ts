import { getTodayDateKey } from "../page/helpers";
import {
  getTodayWeightRecord,
  getWeightHistory,
  saveWeightRecord,
} from "../storage";

describe("体重記録の「今日」判定", () => {
  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it("日本時間の朝でも当日のキーになる", () => {
    // 2026-08-13 07:00 JST = 2026-08-12 22:00 UTC
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(getTodayDateKey()).toBe("2026-08-13");
  });

  it("夜に記録した前日分を翌朝の記録が上書きしない", () => {
    // 日付キーが UTC 基準だと、夜と翌朝が同じキーになって前日分が消える
    jest.useFakeTimers();

    jest.setSystemTime(new Date("2026-08-12T11:00:00Z")); // 8/12 20:00 JST
    saveWeightRecord(getTodayDateKey(), 70);
    jest.setSystemTime(new Date("2026-08-12T22:00:00Z")); // 8/13 07:00 JST
    saveWeightRecord(getTodayDateKey(), 69.5);

    const history = getWeightHistory();
    expect(Object.keys(history).sort()).toEqual(["2026-08-12", "2026-08-13"]);
    expect(history["2026-08-12"].weight).toBe(70);
    expect(history["2026-08-13"].weight).toBe(69.5);
  });

  it("朝に記録した内容を同じ朝に読み出せる", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    saveWeightRecord(getTodayDateKey(), 68);

    expect(getTodayWeightRecord()?.weight).toBe(68);
  });
});
