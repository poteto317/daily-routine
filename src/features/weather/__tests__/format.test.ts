import {
  formatDate,
  formatHourlyTime,
  getWeatherIcon,
  getWeatherLabel,
  isToday,
} from "../page/format";

describe("weather page format", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe("getWeatherIcon", () => {
    it.each([
      ["sunny", "☀️"],
      ["partly-cloudy", "⛅"],
      ["cloudy", "☁️"],
      ["rainy", "🌧️"],
      ["snowy", "❄️"],
    ] as const)("%s のアイコンを返す", (weather, icon) => {
      expect(getWeatherIcon(weather)).toBe(icon);
    });

    it("未知の値は既定のアイコンを返す", () => {
      expect(getWeatherIcon("foggy" as never)).toBe("🌤️");
    });
  });

  describe("getWeatherLabel", () => {
    it.each([
      ["sunny", "晴れ"],
      ["partly-cloudy", "晴れ時々曇り"],
      ["cloudy", "曇り"],
      ["rainy", "雨"],
      ["snowy", "雪"],
    ] as const)("%s のラベルを返す", (weather, label) => {
      expect(getWeatherLabel(weather)).toBe(label);
    });

    it("未知の値は晴れのラベルを返す", () => {
      // アイコンは既定の 🌤️ だがラベルは「晴れ」になる（現状を固定）
      expect(getWeatherLabel("foggy" as never)).toBe("晴れ");
    });
  });

  describe("formatDate", () => {
    it("月日を 0 埋めなしの M/D にする", () => {
      expect(formatDate("2026-03-07")).toBe("3/7");
    });

    it("年末・年始と月末を整形する", () => {
      expect(formatDate("2026-12-31")).toBe("12/31");
      expect(formatDate("2027-01-01")).toBe("1/1");
      expect(formatDate("2028-02-29")).toBe("2/29");
    });
  });

  describe("formatHourlyTime", () => {
    it("ローカル時刻の時を H:00 にする", () => {
      expect(formatHourlyTime("2026-03-07T09:30:00+09:00")).toBe("9:00");
      expect(formatHourlyTime("2026-03-07T15:00:00Z")).toBe("0:00");
      expect(formatHourlyTime("2026-03-07T23:59:00+09:00")).toBe("23:00");
    });
  });

  describe("isToday", () => {
    it("JST の今日の日付なら true", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-03-07T00:30:00+09:00"));

      expect(isToday("2026-03-07")).toBe(true);
    });

    it("前日・翌日は false", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));

      expect(isToday("2026-03-06")).toBe(false);
      expect(isToday("2026-03-08")).toBe(false);
    });
  });
});
