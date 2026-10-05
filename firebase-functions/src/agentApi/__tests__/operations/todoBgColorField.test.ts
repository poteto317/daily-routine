/** @jest-environment node */
import { readBgColor } from "../../operations/todo/todoBgColorField";

describe("readBgColor", () => {
  it("許可された 7 色を正しく読み取る", () => {
    expect(readBgColor({ c: "bg-red-50" }, "c")).toBe("bg-red-50");
    expect(readBgColor({ c: "bg-orange-50" }, "c")).toBe("bg-orange-50");
    expect(readBgColor({ c: "bg-yellow-50" }, "c")).toBe("bg-yellow-50");
    expect(readBgColor({ c: "bg-green-50" }, "c")).toBe("bg-green-50");
    expect(readBgColor({ c: "bg-blue-50" }, "c")).toBe("bg-blue-50");
    expect(readBgColor({ c: "bg-purple-50" }, "c")).toBe("bg-purple-50");
    expect(readBgColor({ c: "bg-pink-50" }, "c")).toBe("bg-pink-50");
  });

  it("null は null（解除）として読み取る", () => {
    expect(readBgColor({ c: null }, "c")).toBeNull();
  });

  it("未指定（undefined）は undefined を返す", () => {
    expect(readBgColor({}, "c")).toBeUndefined();
    expect(readBgColor({ other: "val" }, "c")).toBeUndefined();
  });

  it("許可されていない文字列は 400 invalid_field", () => {
    expect(() => readBgColor({ c: "red" }, "c")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
    expect(() => readBgColor({ c: "" }, "c")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
    expect(() => readBgColor({ c: "bg-black-50" }, "c")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });
});
