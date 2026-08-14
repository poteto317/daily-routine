import { saveSyncDataToLocal } from "@/features/sync/sync/localData";
import { getWeightHistory } from "@/features/weight-tracker/storage";
import { getMealHistory } from "@/features/meal/storage";

describe("クラウドから復元したデータの日付キー", () => {
  afterEach(() => localStorage.clear());

  it("誤った日付キーのまま取り込まない", () => {
    // クラウド側には修正前に保存された記録が残っている。
    // そのまま書き戻すと、せっかく直したローカルが元へ戻る。
    saveSyncDataToLocal({
      weightHistory: {
        "2026-08-12": {
          id: "a",
          date: "2026-08-12",
          weight: 69.5,
          createdAt: "2026-08-12T22:00:00Z",
          updatedAt: "2026-08-12T22:00:00Z",
        },
      },
    } as never);

    expect(Object.keys(getWeightHistory())).toEqual(["2026-08-13"]);
  });

  it("食事の記録も直す", () => {
    saveSyncDataToLocal({
      mealHistory: {
        "2026-08-12": [
          {
            id: "m",
            date: "2026-08-12",
            mealType: "breakfast",
            time: "07:10",
            description: "トースト",
            createdAt: "2026-08-12T22:00:00Z",
            updatedAt: "2026-08-12T22:00:00Z",
          },
        ],
      },
    } as never);

    expect(Object.keys(getMealHistory())).toEqual(["2026-08-13"]);
  });

  it("正しい日付キーの記録はそのまま取り込む", () => {
    saveSyncDataToLocal({
      weightHistory: {
        "2026-08-12": {
          id: "a",
          date: "2026-08-12",
          weight: 70,
          createdAt: "2026-08-12T11:00:00Z",
          updatedAt: "2026-08-12T11:00:00Z",
        },
      },
    } as never);

    expect(Object.keys(getWeightHistory())).toEqual(["2026-08-12"]);
  });
});
