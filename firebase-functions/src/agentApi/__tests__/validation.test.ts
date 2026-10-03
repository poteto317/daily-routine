/** @jest-environment node */
import { ApiError } from "../errors";
import {
  asJsonObject,
  assertKnownKeys,
  compact,
  parseQueryDate,
  parseQueryMonth,
  readAmount,
  readDate,
  readEnum,
  readMonth,
  readString,
  readTime,
  required,
} from "../validation";

const expectApiError = (fn: () => unknown, status: number, code: string) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(status);
    expect((error as ApiError).code).toBe(code);
    return;
  }
  throw new Error("ApiError が投げられなかった");
};

describe("asJsonObject", () => {
  it("オブジェクトはそのまま返す", () => {
    expect(asJsonObject({ a: 1 })).toEqual({ a: 1 });
  });

  it.each([null, undefined, [], "x", 1])("%p は 400 invalid_body", (value) => {
    expectApiError(() => asJsonObject(value), 400, "invalid_body");
  });
});

describe("assertKnownKeys", () => {
  it("未知キーは 400 unknown_field", () => {
    expectApiError(
      () => assertKnownKeys({ name: "a", typo: 1 }, ["name"]),
      400,
      "unknown_field",
    );
  });

  it("既知キーのみなら何も投げない", () => {
    expect(() => assertKnownKeys({ name: "a" }, ["name"])).not.toThrow();
  });
});

describe("readString", () => {
  it("未指定は undefined", () => {
    expect(readString({}, "name", { maxLength: 5 })).toBeUndefined();
  });

  it("trim 指定で前後の空白を除去する", () => {
    expect(readString({ name: " a " }, "name", { maxLength: 5, trim: true })).toBe(
      "a",
    );
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

  it("最大長超過は 400", () => {
    expectApiError(
      () => readString({ name: "abcdef" }, "name", { maxLength: 5 }),
      400,
      "invalid_field",
    );
  });

  it("文字列以外は 400", () => {
    expectApiError(
      () => readString({ name: 1 }, "name", { maxLength: 5 }),
      400,
      "invalid_field",
    );
  });
});

describe("readAmount", () => {
  it("正の有限数を返す", () => {
    expect(readAmount({ amount: 1200 }, "amount")).toBe(1200);
  });

  it.each([0, -1, Infinity, "100", null, 1_000_000_001])(
    "%p は 400",
    (amount) => {
      expectApiError(() => readAmount({ amount }, "amount"), 400, "invalid_field");
    },
  );
});

describe("readDate / readMonth / readTime", () => {
  it("実在する日付を受け付ける", () => {
    expect(readDate({ date: "2026-02-28" }, "date")).toBe("2026-02-28");
  });

  it.each(["2026-02-30", "2026-13-01", "20260201", "2026-2-1"])(
    "日付 %p は 400",
    (date) => {
      expectApiError(() => readDate({ date }, "date"), 400, "invalid_field");
    },
  );

  it("月と時刻の形式を検証する", () => {
    expect(readMonth({ month: "2026-02" }, "month")).toBe("2026-02");
    expect(readTime({ t: "09:05" }, "t")).toBe("09:05");
    expectApiError(() => readMonth({ month: "2026-00" }, "month"), 400, "invalid_field");
    expectApiError(() => readTime({ t: "24:00" }, "t"), 400, "invalid_field");
  });
});

describe("readEnum", () => {
  it("許可値のみ受け付ける", () => {
    expect(readEnum({ kind: "fixed" }, "kind", ["fixed", "variable"])).toBe(
      "fixed",
    );
    expectApiError(
      () => readEnum({ kind: "x" }, "kind", ["fixed", "variable"]),
      400,
      "invalid_field",
    );
  });
});

describe("parseQuery*", () => {
  it("未指定は undefined、不正は 400", () => {
    expect(parseQueryMonth(undefined)).toBeUndefined();
    expect(parseQueryMonth("2026-02")).toBe("2026-02");
    expectApiError(() => parseQueryMonth("2026-2"), 400, "invalid_query");
    expect(parseQueryDate("2026-02-03")).toBe("2026-02-03");
    expectApiError(() => parseQueryDate("x"), 400, "invalid_query");
  });
});

describe("required / compact", () => {
  it("required は undefined なら 400", () => {
    expect(required("name", "a")).toBe("a");
    expectApiError(() => required("name", undefined), 400, "invalid_field");
  });

  it("compact は undefined のキーを除去する", () => {
    expect(compact({ a: 1, b: undefined })).toEqual({ a: 1 });
  });
});
