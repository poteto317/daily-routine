import { getStorageWriteFailureMessage } from "../storageWriteFailureHelpers";

describe("getStorageWriteFailureMessage", () => {
  it("上限超過のときは対処方法まで含めた文言を返す", () => {
    const message = getStorageWriteFailureMessage("quota-exceeded");

    expect(message).toContain("保存できる容量の上限に達したため");
    expect(message).toContain(
      "不要な記録を削除してから、もう一度お試しください",
    );
  });

  it("原因が不明なときは別の文言を返す", () => {
    expect(getStorageWriteFailureMessage("unknown")).toContain(
      "データの保存に失敗しました",
    );
  });

  it("理由ごとに異なる文言を返す", () => {
    // 同じ文言を返してしまうと、出し分けの意味がなくなる
    expect(getStorageWriteFailureMessage("quota-exceeded")).not.toBe(
      getStorageWriteFailureMessage("unknown"),
    );
  });
});
