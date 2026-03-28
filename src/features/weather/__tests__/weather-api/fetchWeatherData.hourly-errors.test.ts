import { fetchWeatherData } from "../../weather-api";
import { mockFetch, mockWeatherAndLocation } from "./testUtils";

describe("fetchWeatherData hourly/errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("includeHourly=true でAPIの hourly データを全件返す", async () => {
    const start = new Date("2026-02-09T00:00:00.000Z");
    const hourlyTimes = Array.from({ length: 30 }, (_, i) => {
      const time = new Date(start.getTime() + i * 60 * 60 * 1000);
      return time.toISOString();
    });

    mockWeatherAndLocation({
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: "Asia/Tokyo",
      daily: {
        time: ["2026-02-09"],
        temperature_2m_max: [16],
        temperature_2m_min: [8],
        precipitation_probability_max: [10],
        weather_code: [0],
      },
      hourly: {
        time: hourlyTimes,
        temperature_2m: hourlyTimes.map(() => 12),
        precipitation_probability: hourlyTimes.map(() => 20),
        relative_humidity_2m: hourlyTimes.map(() => 60),
        wind_speed_10m: hourlyTimes.map(() => 4),
        weather_code: hourlyTimes.map(() => 0),
      },
    });

    const result = await fetchWeatherData(35.6762, 139.6503, true);

    expect(result.hourly).toBeDefined();
    expect(result.hourly).toHaveLength(30);
    expect(result.hourly?.[0].time).toBe("2026-02-09T00:00:00.000Z");
  });

  it("API失敗時はエラーをスローする", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(fetchWeatherData()).rejects.toThrow(
      "天気データの取得に失敗しました: 500",
    );
  });

  it("地名取得失敗時は座標フォールバックを返す", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          latitude: 35.6762,
          longitude: 139.6503,
          timezone: "Asia/Tokyo",
          daily: {
            time: ["2026-02-09"],
            temperature_2m_max: [15],
            temperature_2m_min: [8],
            precipitation_probability_max: [10],
            weather_code: [0],
          },
        }),
      } as Response)
      .mockResolvedValueOnce({ ok: false } as Response);

    const result = await fetchWeatherData();

    expect(result.location).toBe("35.68, 139.65");
  });
});
