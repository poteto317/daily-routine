import { getTodayDateString } from "../utils/mealFormat";
import { addMealRecord, getMealHistory, getTodayMealRecords } from "../storage";

describe("食事記録の「今日」判定", () => {
  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it("日本時間の朝でも当日のキーになる", () => {
    // 2026-08-13 07:00 JST = 2026-08-12 22:00 UTC
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(getTodayDateString()).toBe("2026-08-13");
  });

  it("朝食が前日の記録として保存されない", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    addMealRecord(getTodayDateString(), "breakfast", "07:10", "トースト");

    expect(Object.keys(getMealHistory())).toEqual(["2026-08-13"]);
    expect(getTodayMealRecords()).toHaveLength(1);
  });
});
