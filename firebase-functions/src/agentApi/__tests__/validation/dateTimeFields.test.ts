/** @jest-environment node */
import { readDate, readTime } from "../../validation/dateTimeFields";
import { expectApiError } from "../testUtils";

describe("readDate", () => {
  it("未指定は undefined、実在する日付（閏日を含む）は返す", () => {
    expect(readDate({}, "date")).toBeUndefined();
    expect(readDate({ date: "2026-02-28" }, "date")).toBe("2026-02-28");
    expect(readDate({ date: "2024-02-29" }, "date")).toBe("2024-02-29");
  });

  it.each(["2026-02-30", "2025-02-29", "2026-13-01", "20260201", "2026-2-1"])(
    "日付 %p は 400",
    (date) => {
      expectApiError(() => readDate({ date }, "date"), 400, "invalid_field");
    },
  );

  it.each([20260201, null, true])("文字列以外 %p は 400", (date) => {
    expectApiError(() => readDate({ date }, "date"), 400, "invalid_field");
  });
});

describe("readTime", () => {
  it("未指定は undefined、HH:mm は返す", () => {
    expect(readTime({}, "t")).toBeUndefined();
    expect(readTime({ t: "09:05" }, "t")).toBe("09:05");
    expect(readTime({ t: "23:59" }, "t")).toBe("23:59");
  });

  it.each(["24:00", "12:60", "9:05", "0905", 905, null])("%p は 400", (t) => {
    expectApiError(() => readTime({ t }, "t"), 400, "invalid_field");
  });
});
