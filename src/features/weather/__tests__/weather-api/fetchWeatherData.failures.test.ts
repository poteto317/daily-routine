import { fetchWeatherData, type OpenMeteoResponse } from "../../weather-api";
import {
  createDailyResponse,
  mockFetch,
  mockWeatherAndLocation,
} from "./testUtils";

const HOURLY_TIMES = ["2026-02-09T00:00", "2026-02-09T01:00"];

const createHourly = (
  overrides: Partial<NonNullable<OpenMeteoResponse["hourly"]>> = {},
): NonNullable<OpenMeteoResponse["hourly"]> => ({
  time: HOURLY_TIMES,
  temperature_2m: [10.4, 10.6],
  precipitation_probability: [20, 30],
  relative_humidity_2m: [60.2, 70.7],
  wind_speed_10m: [3.4, 3.5],
  weather_code: [0, 61],
  ...overrides,
});

describe("fetchWeatherData の失敗経路と不完全な応答", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("通信に失敗したら、その例外のまま拒否し地名 API は呼ばない", async () => {
    const error = new TypeError("Failed to fetch");
    mockFetch.mockRejectedValueOnce(error);

    await expect(fetchWeatherData()).rejects.toBe(error);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("HTTP エラーはステータスコードを含むメッセージで拒否する", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 } as Response);

    await expect(fetchWeatherData()).rejects.toThrow(
      "天気データの取得に失敗しました: 404",
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("本文が JSON として読めなければ拒否する", async () => {
    const error = new SyntaxError("Unexpected token <");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw error;
      },
    } as unknown as Response);

    await expect(fetchWeatherData()).rejects.toBe(error);
  });

  it("daily が無い応答は検証せずに読むため、TypeError で拒否する", async () => {
    // 応答の形は検証していない（型注釈のみ）。現状の振る舞いを固定するテスト。
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ latitude: 35.6762, longitude: 139.6503 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ address: { city: "東京都" } }),
      } as Response);

    await expect(fetchWeatherData()).rejects.toThrow(TypeError);
  });

  it("daily が空配列なら予報 0 件で解決する", async () => {
    mockWeatherAndLocation({
      ...createDailyResponse(0),
      daily: {
        time: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
        precipitation_probability_max: [],
        weather_code: [],
      },
    });

    const result = await fetchWeatherData();

    expect(result.forecasts).toEqual([]);
  });

  it("地名の取得に失敗しても天気データは座標を地名として解決する", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => createDailyResponse(0),
      } as Response)
      .mockRejectedValueOnce(new Error("offline"));

    const result = await fetchWeatherData();

    expect(result.location).toBe("35.68, 139.65");
    expect(result.forecasts).toHaveLength(1);
  });

  it("includeHourly=true でも応答に hourly が無ければ hourly は undefined", async () => {
    mockWeatherAndLocation(createDailyResponse(0));

    const result = await fetchWeatherData(35.6762, 139.6503, true);

    expect(result.hourly).toBeUndefined();
  });

  it("includeHourly=false なら応答に hourly があっても hourly は undefined", async () => {
    mockWeatherAndLocation({
      ...createDailyResponse(0),
      hourly: createHourly(),
    });

    const result = await fetchWeatherData(35.6762, 139.6503, false);

    expect(result.hourly).toBeUndefined();
  });

  it("hourly の数値は丸め、降水確率の null / undefined は 0 として扱う", async () => {
    mockWeatherAndLocation({
      ...createDailyResponse(0),
      hourly: createHourly({ precipitation_probability: [null, undefined] }),
    });

    const result = await fetchWeatherData(35.6762, 139.6503, true);

    expect(result.hourly).toEqual([
      {
        time: HOURLY_TIMES[0],
        weather: "sunny",
        temperature: 10,
        precipitation: 0,
        humidity: 60,
        windSpeed: 3,
      },
      {
        time: HOURLY_TIMES[1],
        weather: "rainy",
        temperature: 11,
        precipitation: 0,
        humidity: 71,
        windSpeed: 4,
      },
    ]);
  });
});
