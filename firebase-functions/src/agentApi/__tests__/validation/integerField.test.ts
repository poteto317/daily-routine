/** @jest-environment node */
import { readInteger } from "../../validation";

const RANGE = { min: 0, max: 3 };

describe("readInteger", () => {
  it("範囲内の整数を返し、未指定は undefined", () => {
    expect(readInteger({ a: 0 }, "a", RANGE)).toBe(0);
    expect(readInteger({ a: 3 }, "a", RANGE)).toBe(3);
    expect(readInteger({}, "a", RANGE)).toBeUndefined();
  });

  it.each([[-1], [4], [1.5], ["1"], [null], [Number.NaN]])(
    "範囲外・非整数 (%p) は 400",
    (value) => {
      expect(() => readInteger({ a: value }, "a", RANGE)).toThrow(
        expect.objectContaining({ status: 400, code: "invalid_field" }),
      );
    },
  );
});
