import { fetchWeatherData } from "../../weather-api";
import { createDailyResponse, mockWeatherAndLocation } from "./testUtils";

describe("fetchWeatherData weather mapping", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [0, "sunny", "快晴"],
    [1, "partly-cloudy", "晴れたり曇ったり"],
    [3, "cloudy", "曇り"],
    [61, "rainy", "雨"],
    [71, "snowy", "雪"],
  ] as const)(
    "WMOコード %s を %s に変換する",
    async (code, weather, descriptionPart) => {
      mockWeatherAndLocation(createDailyResponse(code));

      const result = await fetchWeatherData();

      expect(result.forecasts[0].weather).toBe(weather);
      expect(result.forecasts[0].description).toContain(descriptionPart);
    },
  );

  it("曜日を日本語の曜日で返す", async () => {
    mockWeatherAndLocation(createDailyResponse(0));

    const result = await fetchWeatherData();

    expect(["日", "月", "火", "水", "木", "金", "土"]).toContain(
      result.forecasts[0].dayOfWeek,
    );
  });

  it("気温は四捨五入する", async () => {
    mockWeatherAndLocation(createDailyResponse(0));

    const result = await fetchWeatherData();

    expect(result.forecasts[0].temperature.high).toBe(16);
    expect(result.forecasts[0].temperature.low).toBe(8);
  });
});
