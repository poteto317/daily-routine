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

  it("復元中に更新時刻を余計に書かない", () => {
    // 移行がバッチの外で保存すると、そのたびに更新時刻が書かれて
    // LOCAL_DATA_UPDATED_AT_EVENT が飛び、購読側が一瞬「ローカル変更あり」
    // と判断しうる。更新時刻の確定は復元の最後の 1 回だけにする。
    const setItem = jest.spyOn(Storage.prototype, "setItem");

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
      lastModified: 1234567890,
    } as never);

    const timestampWrites = setItem.mock.calls.filter(([key]) =>
      String(key).includes("local-data-updated-at"),
    );
    expect(timestampWrites).toHaveLength(1);
    setItem.mockRestore();
  });

  it("更新時刻を抑制した復元では一度も書かない", () => {
    // ダウンロードは呼び出し元がリモートの時刻を入れる。
    // ここで書くと、その値が上書きされる前に別の値が観測される。
    const setItem = jest.spyOn(Storage.prototype, "setItem");

    saveSyncDataToLocal(
      {
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
      } as never,
      { skipTimestampUpdate: true },
    );

    const timestampWrites = setItem.mock.calls.filter(([key]) =>
      String(key).includes("local-data-updated-at"),
    );
    expect(timestampWrites).toHaveLength(0);
    setItem.mockRestore();
  });
});
