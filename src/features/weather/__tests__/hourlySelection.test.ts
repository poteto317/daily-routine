import {
  getDefaultSelectedForecastDate,
  getHourlyForecastsForDate,
  getHourlyForecastsForSelectedDate,
  getUpcomingHourlyForecasts,
  isTodayForecastDate,
  resolveSelectedForecastDate,
  toLocalDateKey,
} from "../page/hourlySelection";

describe("hourlySelection", () => {
  it("toLocalDateKey はローカル日付キーへ変換する", () => {
    expect(toLocalDateKey(new Date("2026-02-10T10:00:00.000Z"))).toBe(
      "2026-02-10",
    );
  });

  it("isTodayForecastDate は今日かどうかを判定する", () => {
    expect(
      isTodayForecastDate("2026-02-10", new Date("2026-02-10T10:00:00.000Z")),
    ).toBe(true);
    expect(
      isTodayForecastDate("2026-02-11", new Date("2026-02-10T10:00:00.000Z")),
    ).toBe(false);
  });

  it("today が含まれていればそれを初期選択する", () => {
    expect(
      getDefaultSelectedForecastDate(
        ["2026-02-09", "2026-02-10"],
        "2026-02-10",
      ),
    ).toBe("2026-02-10");
  });

  it("today がなければ先頭日付を返す", () => {
    expect(
      getDefaultSelectedForecastDate(
        ["2026-02-09", "2026-02-10"],
        "2026-02-08",
      ),
    ).toBe("2026-02-09");
  });

  it("resolveSelectedForecastDate は有効な選択日付を優先する", () => {
    expect(
      resolveSelectedForecastDate(
        ["2026-02-09", "2026-02-10"],
        "2026-02-10",
        "2026-02-09",
      ),
    ).toBe("2026-02-10");
  });

  it("resolveSelectedForecastDate は無効な選択日付ならデフォルトへ戻す", () => {
    expect(
      resolveSelectedForecastDate(
        ["2026-02-09", "2026-02-10"],
        "2026-02-11",
        "2026-02-09",
      ),
    ).toBe("2026-02-09");
  });

  it("選択日付の hourly だけを返す", () => {
    expect(
      getHourlyForecastsForSelectedDate(
        [
          {
            time: "2026-02-09T00:00:00.000Z",
            weather: "sunny",
            temperature: 10,
            precipitation: 0,
            humidity: 40,
            windSpeed: 2,
          },
          {
            time: "2026-02-10T00:00:00.000Z",
            weather: "cloudy",
            temperature: 8,
            precipitation: 20,
            humidity: 50,
            windSpeed: 3,
          },
        ],
        "2026-02-10",
      ),
    ).toEqual([
      {
        time: "2026-02-10T00:00:00.000Z",
        weather: "cloudy",
        temperature: 8,
        precipitation: 20,
        humidity: 50,
        windSpeed: 3,
      },
    ]);
  });

  it("今日を選択した場合は現在時刻以降を24件まで返す", () => {
    const hourly = Array.from({ length: 30 }, (_, index) => ({
      time: new Date(
        Date.parse("2026-02-10T00:00:00.000Z") + index * 60 * 60 * 1000,
      ).toISOString(),
      weather: "sunny" as const,
      temperature: 10,
      precipitation: 0,
      humidity: 40,
      windSpeed: 2,
    }));

    const result = getUpcomingHourlyForecasts(
      hourly,
      new Date("2026-02-10T10:00:00.000Z"),
    );

    expect(result).toHaveLength(20);
    expect(result[0]?.time).toBe("2026-02-10T10:00:00.000Z");
  });

  it("今日以外を選択した場合はその日付のデータだけを返す", () => {
    const result = getHourlyForecastsForDate(
      [
        {
          time: "2026-02-10T14:00:00.000Z",
          weather: "sunny",
          temperature: 10,
          precipitation: 0,
          humidity: 40,
          windSpeed: 2,
        },
        {
          time: "2026-02-11T00:00:00.000Z",
          weather: "cloudy",
          temperature: 8,
          precipitation: 20,
          humidity: 50,
          windSpeed: 3,
        },
      ],
      "2026-02-11",
      new Date("2026-02-10T10:00:00.000Z"),
    );

    expect(result).toEqual([
      {
        time: "2026-02-11T00:00:00.000Z",
        weather: "cloudy",
        temperature: 8,
        precipitation: 20,
        humidity: 50,
        windSpeed: 3,
      },
    ]);
  });

  it("getHourlyForecastsForDate は入力不足なら空配列を返す", () => {
    expect(getHourlyForecastsForDate(undefined, "2026-02-10")).toEqual([]);
    expect(getHourlyForecastsForDate([], null)).toEqual([]);
  });
});
