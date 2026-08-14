import { migrateWeightDateKeys } from "../migrateWeightDateKeys";
import { getWeightHistory, saveWeightHistory } from "../storage";
import type { WeightHistory, WeightRecord } from "@/types/routine";

const record = (
  date: string,
  createdAt: string,
  weight: number,
): WeightRecord => ({
  id: `id-${date}-${weight}`,
  date,
  weight,
  createdAt,
  updatedAt: createdAt,
});

const seed = (history: WeightHistory) => saveWeightHistory(history);

describe("migrateWeightDateKeys", () => {
  afterEach(() => localStorage.clear());

  it("朝に記録された分を正しい日付へ移す", () => {
    // 2026-08-13 07:00 JST に作られたが 2026-08-12 で保存されている
    seed({ "2026-08-12": record("2026-08-12", "2026-08-12T22:00:00Z", 69.5) });

    expect(migrateWeightDateKeys()).toBe(1);

    const history = getWeightHistory();
    expect(Object.keys(history)).toEqual(["2026-08-13"]);
    expect(history["2026-08-13"].weight).toBe(69.5);
  });

  it("移した記録の date も新しい日付に揃える", () => {
    // date が古いままだと、記録を開いたときに別の日付が表示される
    seed({ "2026-08-12": record("2026-08-12", "2026-08-12T22:00:00Z", 69.5) });

    migrateWeightDateKeys();

    expect(getWeightHistory()["2026-08-13"].date).toBe("2026-08-13");
  });

  it("夜に記録された分は動かさない", () => {
    seed({ "2026-08-12": record("2026-08-12", "2026-08-12T11:00:00Z", 70) });

    expect(migrateWeightDateKeys()).toBe(0);
    expect(Object.keys(getWeightHistory())).toEqual(["2026-08-12"]);
  });

  it("移し先に記録があれば移さない", () => {
    // 夜に記録した正しい記録を消さない
    seed({
      "2026-08-12": record("2026-08-12", "2026-08-12T22:00:00Z", 69.5),
      "2026-08-13": record("2026-08-13", "2026-08-13T11:00:00Z", 71),
    });

    expect(migrateWeightDateKeys()).toBe(0);
    const history = getWeightHistory();
    expect(history["2026-08-12"].weight).toBe(69.5);
    expect(history["2026-08-13"].weight).toBe(71);
  });

  it("複数日分をまとめて移す", () => {
    seed({
      "2026-08-11": record("2026-08-11", "2026-08-11T22:00:00Z", 70),
      "2026-08-12": record("2026-08-12", "2026-08-12T22:00:00Z", 69.5),
    });

    expect(migrateWeightDateKeys()).toBe(2);
    expect(Object.keys(getWeightHistory()).sort()).toEqual([
      "2026-08-12",
      "2026-08-13",
    ]);
  });

  it("createdAt が無い記録は動かさない", () => {
    seed({
      "2026-08-12": {
        id: "x",
        date: "2026-08-12",
        weight: 70,
      } as unknown as WeightRecord,
    });

    expect(migrateWeightDateKeys()).toBe(0);
    expect(Object.keys(getWeightHistory())).toEqual(["2026-08-12"]);
  });

  it("移すものが無ければ保存し直さない", () => {
    // 無駄な書き込みで更新時刻が進み、同期が不要な差分を作る
    seed({ "2026-08-12": record("2026-08-12", "2026-08-12T11:00:00Z", 70) });
    const setItem = jest.spyOn(Storage.prototype, "setItem");

    migrateWeightDateKeys();

    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});
