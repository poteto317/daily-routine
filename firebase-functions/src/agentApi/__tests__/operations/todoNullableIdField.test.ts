/** @jest-environment node */
import { readNullableId } from "../../operations/todo/todoNullableIdField";

describe("readNullableId", () => {
  it("文字列の ID をトリムして読み取る", () => {
    expect(readNullableId({ id: " cat-1 " }, "id")).toBe("cat-1");
  });

  it("null は null（解除）として読み取る", () => {
    expect(readNullableId({ id: null }, "id")).toBeNull();
  });

  it("未指定は undefined を返す", () => {
    expect(readNullableId({}, "id")).toBeUndefined();
  });

  it("文字列以外の型は 400 invalid_field", () => {
    expect(() => readNullableId({ id: 123 }, "id")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
    expect(() => readNullableId({ id: true }, "id")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });

  it("空文字・空白のみは 400 invalid_field", () => {
    expect(() => readNullableId({ id: "" }, "id")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
    expect(() => readNullableId({ id: "   " }, "id")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });

  it("文字数上限（200文字）を超えると 400", () => {
    expect(() => readNullableId({ id: "a".repeat(201) }, "id")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });
});
