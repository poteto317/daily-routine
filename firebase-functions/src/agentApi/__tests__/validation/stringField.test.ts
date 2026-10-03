/** @jest-environment node */
import { readString } from "../../validation/stringField";
import { expectApiError } from "../testUtils";

describe("readString", () => {
  it("未指定は undefined", () => {
    expect(readString({}, "name", { maxLength: 5 })).toBeUndefined();
  });

  it("trim 指定で前後の空白を除去する", () => {
    expect(
      readString({ name: " a " }, "name", { maxLength: 5, trim: true }),
    ).toBe("a");
  });

  it("trim 未指定なら空白を保持する", () => {
    expect(readString({ name: " a " }, "name", { maxLength: 5 })).toBe(" a ");
  });

  it("trim 後に空なら 400 invalid_field", () => {
    expectApiError(
      () => readString({ name: "  " }, "name", { maxLength: 5, trim: true }),
      400,
      "invalid_field",
    );
  });

  it("allowEmpty なら空文字を許可する", () => {
    expect(readString({ t: "" }, "t", { maxLength: 5, allowEmpty: true })).toBe(
      "",
    );
  });

  it("空文字は allowEmpty なしだと 400", () => {
    expectApiError(
      () => readString({ t: "" }, "t", { maxLength: 5 }),
      400,
      "invalid_field",
    );
  });

  it("最大長ちょうどは許可し、超過は 400", () => {
    expect(readString({ name: "abcde" }, "name", { maxLength: 5 })).toBe(
      "abcde",
    );
    expectApiError(
      () => readString({ name: "abcdef" }, "name", { maxLength: 5 }),
      400,
      "invalid_field",
    );
  });

  it("最大長は trim 後の長さで判定する", () => {
    expect(
      readString({ name: "  abcde  " }, "name", { maxLength: 5, trim: true }),
    ).toBe("abcde");
  });

  it.each([1, null, true, {}, []])("文字列以外 %p は 400", (name) => {
    expectApiError(
      () => readString({ name }, "name", { maxLength: 5 }),
      400,
      "invalid_field",
    );
  });
});
