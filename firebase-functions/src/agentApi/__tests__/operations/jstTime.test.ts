/** @jest-environment node */
import { formatJstTime, toJstDateKey } from "../../operations/jstTime";

describe("formatJstTime", () => {
  it("UTC の時刻を JST の HH:mm にする", () => {
    expect(formatJstTime(new Date("2026-10-03T00:30:00.000Z"))).toBe("09:30");
    expect(formatJstTime(new Date("2026-10-03T15:05:00.000Z"))).toBe("00:05");
  });
});

describe("toJstDateKey", () => {
  it("UTC の日時を JST の日付（YYYY-MM-DD）にする", () => {
    expect(toJstDateKey(new Date("2026-10-03T00:30:00.000Z"))).toBe(
      "2026-10-03",
    );
  });

  it("UTC では前日でも、JST の 0 時以降なら、JST の日付にする", () => {
    expect(toJstDateKey(new Date("2026-10-02T15:00:00.000Z"))).toBe(
      "2026-10-03",
    );
    expect(toJstDateKey(new Date("2026-10-02T14:59:59.999Z"))).toBe(
      "2026-10-02",
    );
  });

  it("月末・年末の繰り上がりを扱える", () => {
    expect(toJstDateKey(new Date("2026-12-31T15:00:00.000Z"))).toBe(
      "2027-01-01",
    );
    expect(toJstDateKey(new Date("2026-02-28T15:00:00.000Z"))).toBe(
      "2026-03-01",
    );
  });
});
