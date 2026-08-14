import { migrateMealDateKeys } from "../migrateMealDateKeys";
import { getMealHistory, saveMealHistory } from "../storage";
import type { MealHistory, MealRecord } from "@/types/routine";

const record = (
  id: string,
  date: string,
  createdAt: string,
  description: string,
): MealRecord => ({
  id,
  date,
  mealType: "breakfast",
  time: "07:10",
  description,
  createdAt,
  updatedAt: createdAt,
});

const seed = (history: MealHistory) => saveMealHistory(history);

describe("migrateMealDateKeys", () => {
  afterEach(() => localStorage.clear());

  it("朝に記録された分を正しい日付へ移す", () => {
    seed({
      "2026-08-12": [
        record("a", "2026-08-12", "2026-08-12T22:00:00Z", "トースト"),
      ],
    });

    expect(migrateMealDateKeys()).toBe(1);

    const history = getMealHistory();
    expect(Object.keys(history)).toEqual(["2026-08-13"]);
    expect(history["2026-08-13"][0].date).toBe("2026-08-13");
  });

  it("同じ日に移す分と残す分が混ざっていても、移す分だけ動かす", () => {
    // 昼に記録した分（ずれていない）と朝に記録した分が同居しうる
    seed({
      "2026-08-12": [
        record("morning", "2026-08-12", "2026-08-12T22:00:00Z", "朝"),
        record("noon", "2026-08-12", "2026-08-12T03:00:00Z", "昼"),
      ],
    });

    expect(migrateMealDateKeys()).toBe(1);

    const history = getMealHistory();
    expect(history["2026-08-12"].map((r) => r.id)).toEqual(["noon"]);
    expect(history["2026-08-13"].map((r) => r.id)).toEqual(["morning"]);
  });

  it("移し先に記録があれば追加する（上書きしない）", () => {
    // 体重と違い 1 日に複数件持てるため、並べて残す
    seed({
      "2026-08-12": [record("a", "2026-08-12", "2026-08-12T22:00:00Z", "朝")],
      "2026-08-13": [record("b", "2026-08-13", "2026-08-13T11:00:00Z", "夜")],
    });

    expect(migrateMealDateKeys()).toBe(1);

    const history = getMealHistory();
    expect(history["2026-08-13"].map((r) => r.id).sort()).toEqual(["a", "b"]);
    expect(history["2026-08-12"]).toBeUndefined();
  });

  it("空になった日付のキーは消す", () => {
    seed({
      "2026-08-12": [record("a", "2026-08-12", "2026-08-12T22:00:00Z", "朝")],
    });

    migrateMealDateKeys();

    expect(getMealHistory()["2026-08-12"]).toBeUndefined();
  });

  it("夜に記録された分は動かさない", () => {
    seed({
      "2026-08-12": [record("a", "2026-08-12", "2026-08-12T11:00:00Z", "夜")],
    });

    expect(migrateMealDateKeys()).toBe(0);
    expect(Object.keys(getMealHistory())).toEqual(["2026-08-12"]);
  });

  it("createdAt が無い記録は動かさない", () => {
    seed({
      "2026-08-12": [{ id: "x", date: "2026-08-12" } as unknown as MealRecord],
    });

    expect(migrateMealDateKeys()).toBe(0);
    expect(Object.keys(getMealHistory())).toEqual(["2026-08-12"]);
  });

  it("移すものが無ければ保存し直さない", () => {
    seed({
      "2026-08-12": [record("a", "2026-08-12", "2026-08-12T11:00:00Z", "夜")],
    });
    const setItem = jest.spyOn(Storage.prototype, "setItem");

    migrateMealDateKeys();

    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});
