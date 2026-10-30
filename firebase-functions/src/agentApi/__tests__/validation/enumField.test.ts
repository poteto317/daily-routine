/** @jest-environment node */
import { isOneOf, readEnum } from "../../validation/enumField";
import { expectApiError } from "../testUtils";

const KINDS = ["fixed", "variable"] as const;

describe("isOneOf", () => {
  it("許可値と完全に一致する文字列だけ true", () => {
    expect(isOneOf(KINDS, "fixed")).toBe(true);
    expect(isOneOf(KINDS, "variable")).toBe(true);
  });

  it.each(["other", "", "FIXED", " fixed", 1, null, undefined, ["fixed"], {}])(
    "%p は false",
    (value) => {
      expect(isOneOf(KINDS, value)).toBe(false);
    },
  );

  it("許可値が空なら常に false", () => {
    expect(isOneOf([], "fixed")).toBe(false);
  });

  it("true のとき値の型を許可値の型に絞り込む", () => {
    const value: unknown = "fixed";
    if (!isOneOf(KINDS, value)) throw new Error("fixed は許可値のはず");
    // 型の絞り込みが効いていれば、許可値の型の変数へ as なしで代入できる
    const kind: (typeof KINDS)[number] = value;
    expect(kind).toBe("fixed");
  });
});

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
