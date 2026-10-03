/** @jest-environment node */
import {
  MAX_AMOUNT,
  readAmount,
  readAmountAllowingZero,
} from "../../validation/amountField";
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

describe("readAmountAllowingZero", () => {
  it("未指定は undefined", () => {
    expect(readAmountAllowingZero({}, "amount")).toBeUndefined();
  });

  it("0 を含む 0 以上の有限数を返す（小数・上限ちょうども許可）", () => {
    expect(readAmountAllowingZero({ amount: 0 }, "amount")).toBe(0);
    expect(readAmountAllowingZero({ amount: 0.5 }, "amount")).toBe(0.5);
    expect(readAmountAllowingZero({ amount: MAX_AMOUNT }, "amount")).toBe(
      MAX_AMOUNT,
    );
  });

  it.each([-1, -0.01, NaN, Infinity, -Infinity, "0", null, MAX_AMOUNT + 1])(
    "%p は 400 invalid_field",
    (amount) => {
      expectApiError(
        () => readAmountAllowingZero({ amount }, "amount"),
        400,
        "invalid_field",
      );
    },
  );

  it("エラーのメッセージは「0 以上」と案内する（readAmount は「0 より大きく」）", () => {
    expectApiError(
      () => readAmountAllowingZero({ amount: -1 }, "amount"),
      400,
      "invalid_field",
    );
    expect(() => readAmountAllowingZero({ amount: -1 }, "amount")).toThrow(
      "0 以上",
    );
    expect(() => readAmount({ amount: 0 }, "amount")).toThrow("0 より大きく");
  });
});
