/** @jest-environment node */
import { readBoolean } from "../../validation";

describe("readBoolean", () => {
  it("true / false を返し、未指定は undefined", () => {
    expect(readBoolean({ a: true }, "a")).toBe(true);
    expect(readBoolean({ a: false }, "a")).toBe(false);
    expect(readBoolean({}, "a")).toBeUndefined();
  });

  it.each([["true"], [1], [null]])("真偽値以外 (%p) は 400", (value) => {
    expect(() => readBoolean({ a: value }, "a")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });
});
