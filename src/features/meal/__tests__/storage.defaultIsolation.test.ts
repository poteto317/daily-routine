import { getMealHistory } from "../storage";
import { addMealRecord } from "../storageMutations";

/**
 * storageMutationsは取得結果のオブジェクトへ直接pushするため、
 * getMealHistory()がモジュールレベルの共有定数(DEFAULT_MEAL_HISTORY)を
 * 参照のまま返すと、その定数が汚染されて以降の取得結果に
 * 前回のデータが混入してしまう。
 */
describe("getMealHistory の既定値の独立性", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("記録追加後にストレージをクリアすると空になる", () => {
    addMealRecord("2026-01-01", "breakfast", "07:00", "朝食");
    expect(Object.keys(getMealHistory())).toEqual(["2026-01-01"]);

    localStorage.clear();

    expect(getMealHistory()).toEqual({});
  });

  it("取得結果を変更しても次回の取得結果に影響しない", () => {
    const history = getMealHistory();
    history["2026-01-01"] = [];

    expect(getMealHistory()).toEqual({});
  });
});
