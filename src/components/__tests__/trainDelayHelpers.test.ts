import {
  formatDelayLastUpdatedTime,
  getDelayMinutesText,
  getDelayReasonText,
  getDelaySeverityColorClass,
  getDelaySeverityIcon,
} from "../trainDelayHelpers";

describe("trainDelayHelpers", () => {
  it("遅延レベルごとの色とアイコンを返す", () => {
    expect(getDelaySeverityColorClass(30)).toContain("bg-red-100");
    expect(getDelaySeverityColorClass(15)).toContain("bg-orange-100");
    expect(getDelaySeverityColorClass(5)).toContain("bg-yellow-100");

    expect(getDelaySeverityIcon(30)).toBe("🚨");
    expect(getDelaySeverityIcon(15)).toBe("⚠️");
    expect(getDelaySeverityIcon(5)).toBe("ℹ️");
  });

  it("時刻・遅延分・理由テキストを整形する", () => {
    expect(formatDelayLastUpdatedTime("2026-03-07T09:05:00+09:00")).toBe("09:05");
    expect(getDelayMinutesText(12)).toContain("12");
    expect(getDelayReasonText("車両点検")).toContain("車両点検");
  });
});
