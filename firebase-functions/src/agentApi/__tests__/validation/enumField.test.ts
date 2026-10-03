/** @jest-environment node */
import { readEnum } from "../../validation/enumField";
import { expectApiError } from "../testUtils";

const KINDS = ["fixed", "variable"] as const;

describe("readEnum", () => {
  it("未指定は undefined、許可値は返す", () => {
    expect(readEnum({}, "kind", KINDS)).toBeUndefined();
    expect(readEnum({ kind: "fixed" }, "kind", KINDS)).toBe("fixed");
    expect(readEnum({ kind: "variable" }, "kind", KINDS)).toBe("variable");
  });

  it.each(["other", "", "FIXED", 1, null])("%p は 400", (kind) => {
    expectApiError(
      () => readEnum({ kind }, "kind", KINDS),
      400,
      "invalid_field",
    );
  });

  it("エラーメッセージに許可値を列挙する", () => {
    expect(() => readEnum({ kind: "x" }, "kind", KINDS)).toThrow(
      /fixed \/ variable/,
    );
  });
});
