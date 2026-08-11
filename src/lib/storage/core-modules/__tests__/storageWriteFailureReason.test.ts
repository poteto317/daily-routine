import {
  isQuotaExceededError,
  toStorageWriteFailureReason,
} from "../storageWriteFailureReason";

describe("isQuotaExceededError", () => {
  it("QuotaExceededError を上限超過と判定する（Chrome/Safari）", () => {
    expect(
      isQuotaExceededError(new DOMException("full", "QuotaExceededError")),
    ).toBe(true);
  });

  it("NS_ERROR_DOM_QUOTA_REACHED を上限超過と判定する（Firefox）", () => {
    expect(
      isQuotaExceededError(
        new DOMException("full", "NS_ERROR_DOM_QUOTA_REACHED"),
      ),
    ).toBe(true);
  });

  it("それ以外の DOMException は上限超過としない", () => {
    expect(
      isQuotaExceededError(new DOMException("denied", "SecurityError")),
    ).toBe(false);
  });

  it("DOMException 以外は上限超過としない", () => {
    // name だけを見て判定すると、同じ名前を持つ普通の Error を
    // 誤って上限超過と扱ってしまう
    expect(isQuotaExceededError(new Error("QuotaExceededError"))).toBe(false);
    expect(isQuotaExceededError(undefined)).toBe(false);
  });
});

describe("toStorageWriteFailureReason", () => {
  it("上限超過は quota-exceeded になる", () => {
    expect(
      toStorageWriteFailureReason(
        new DOMException("full", "QuotaExceededError"),
      ),
    ).toBe("quota-exceeded");
  });

  it("それ以外は unknown になる", () => {
    expect(toStorageWriteFailureReason(new Error("boom"))).toBe("unknown");
    expect(toStorageWriteFailureReason(undefined)).toBe("unknown");
  });
});
