import { fetchWeatherData } from "../../weather-api";
import {
  createDailyResponse,
  mockFetch,
  mockWeatherAndLocation,
} from "./testUtils";

describe("fetchWeatherData daily", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Open-Meteoと地名APIから天気データを取得できる", async () => {
    mockWeatherAndLocation({
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: "Asia/Tokyo",
      daily: {
        time: ["2026-02-09", "2026-02-10", "2026-02-11"],
        temperature_2m_max: [15.5, 16.2, 14.8],
        temperature_2m_min: [8.3, 9.1, 7.5],
        precipitation_probability_max: [10, 30, 80],
        weather_code: [0, 2, 61],
      },
    });

    const result = await fetchWeatherData(35.6762, 139.6503);

    expect(result.location).toBe("東京都");
    expect(result.forecasts).toHaveLength(3);
    expect(result.forecasts[0]).toMatchObject({
      date: "2026-02-09",
      weather: "sunny",
      precipitation: 10,
      temperature: { high: 16, low: 8 },
    });
  });

  it("東京座標で正しいエンドポイントを呼び出し最大7日分に制限する", async () => {
    mockWeatherAndLocation({
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: "Asia/Tokyo",
      daily: {
        time: Array.from(
          { length: 8 },
          (_, i) => `2026-02-${String(9 + i).padStart(2, "0")}`,
        ),
        temperature_2m_max: [15, 16, 14, 17, 18, 15, 16, 17],
        temperature_2m_min: [8, 9, 7, 10, 11, 8, 9, 10],
        precipitation_probability_max: [10, 20, 30, 40, 50, 60, 70, 80],
        weather_code: [0, 1, 2, 3, 61, 71, 0, 1],
      },
    });

    const result = await fetchWeatherData();

    expect(result.forecasts).toHaveLength(7);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("latitude=35.6762"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("longitude=139.6503"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("timezone=auto"),
    );
  });

  it("降水確率nullは0として扱う", async () => {
    mockWeatherAndLocation(createDailyResponse(0, null));

    const result = await fetchWeatherData();

    expect(result.forecasts[0].precipitation).toBe(0);
  });
});
