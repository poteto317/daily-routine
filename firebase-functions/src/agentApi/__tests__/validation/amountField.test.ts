/** @jest-environment node */
import { MAX_AMOUNT, readAmount } from "../../validation/amountField";
import { expectApiError } from "../testUtils";

describe("readAmount", () => {
  it("未指定は undefined", () => {
    expect(readAmount({}, "amount")).toBeUndefined();
  });

  it("正の有限数を返す（小数・上限ちょうども許可）", () => {
    expect(readAmount({ amount: 1200 }, "amount")).toBe(1200);
    expect(readAmount({ amount: 0.5 }, "amount")).toBe(0.5);
    expect(readAmount({ amount: MAX_AMOUNT }, "amount")).toBe(MAX_AMOUNT);
  });

  it.each([0, -1, NaN, Infinity, -Infinity, "100", null, MAX_AMOUNT + 1])(
    "%p は 400 invalid_field",
    (amount) => {
      expectApiError(
        () => readAmount({ amount }, "amount"),
        400,
        "invalid_field",
      );
    },
  );
});
