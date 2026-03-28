import type { WeatherData } from "../api";
import { WEATHER_STATUS_MESSAGES } from "../texts";
import {
  getInitialLocationStatus,
  getWeatherErrorMessage,
  loadCurrentLocationWeather,
  loadInitialWeatherState,
  loadWeatherByCoordinates,
  resetPreferredLocationAndLoad,
  resolveInitialWeatherCoordinates,
  TOKYO_COORDINATES,
} from "../page/pageStateActions";

describe("weather pageStateActions", () => {
  const weatherData: WeatherData = {
    location: "東京",
    lastUpdated: "2026-02-13T00:00:00.000Z",
    forecasts: [],
    hourly: [],
  };

  it("初期座標を解決する", () => {
    expect(resolveInitialWeatherCoordinates(null)).toEqual(TOKYO_COORDINATES);
    expect(
      resolveInitialWeatherCoordinates({ latitude: 34, longitude: 135 }),
    ).toEqual({ latitude: 34, longitude: 135 });
    expect(getInitialLocationStatus(true)).toBe("現在地の天気を表示中");
    expect(getInitialLocationStatus(false)).toBe("東京の天気を表示中");
  });

  it("fetch 後にキャッシュする", async () => {
    const fetchWeatherData = jest.fn().mockResolvedValue(weatherData);
    const cacheWeatherData = jest.fn();

    await expect(
      loadWeatherByCoordinates({
        latitude: 35,
        longitude: 139,
        fetchWeatherData,
        cacheWeatherData,
      }),
    ).resolves.toEqual(weatherData);

    expect(fetchWeatherData).toHaveBeenCalledWith(35, 139, true);
    expect(cacheWeatherData).toHaveBeenCalledWith(weatherData, 35, 139);
  });

  it("初期ロードでキャッシュがあればそれを使う", async () => {
    const loadWeather = jest.fn();
    const cached = { ...weatherData, location: "cached" };

    await expect(
      loadInitialWeatherState({
        preferredLocation: null,
        getCachedWeatherData: jest.fn(() => cached),
        loadWeatherByCoordinates: loadWeather,
      }),
    ).resolves.toEqual({
      weatherData: cached,
      hasPreferredLocation: false,
      locationStatus: "",
      fromCache: true,
    });
    expect(loadWeather).not.toHaveBeenCalled();
  });

  it("初期ロードでキャッシュがなければ取得する", async () => {
    const loadWeather = jest.fn().mockResolvedValue(weatherData);

    await expect(
      loadInitialWeatherState({
        preferredLocation: { latitude: 34, longitude: 135 },
        getCachedWeatherData: jest.fn(() => null),
        loadWeatherByCoordinates: loadWeather,
      }),
    ).resolves.toEqual({
      weatherData,
      hasPreferredLocation: true,
      locationStatus: "現在地の天気を表示中",
      fromCache: false,
    });
    expect(loadWeather).toHaveBeenCalledWith(34, 135);
  });

  it("現在地使用で保存して取得する", async () => {
    const savePreferred = jest.fn();
    const loadWeather = jest.fn().mockResolvedValue(weatherData);

    await expect(
      loadCurrentLocationWeather({
        getUserLocation: jest.fn().mockResolvedValue({ latitude: 34, longitude: 135 }),
        setLocationStatus: jest.fn(),
        savePreferredWeatherLocation: savePreferred,
        loadWeatherByCoordinates: loadWeather,
      }),
    ).resolves.toEqual({
      weatherData,
      hasPreferredLocation: true,
      locationStatus: "現在地の天気を表示中",
    });
    expect(savePreferred).toHaveBeenCalledWith(34, 135);
    expect(loadWeather).toHaveBeenCalledWith(34, 135);
  });

  it("現在地リセットで東京に戻す", async () => {
    const clearPreferred = jest.fn();
    const loadWeather = jest.fn().mockResolvedValue(weatherData);

    await expect(
      resetPreferredLocationAndLoad({
        clearPreferredWeatherLocation: clearPreferred,
        loadWeatherByCoordinates: loadWeather,
      }),
    ).resolves.toEqual({
      weatherData,
      hasPreferredLocation: false,
      locationStatus: WEATHER_STATUS_MESSAGES.locationReset,
    });
    expect(clearPreferred).toHaveBeenCalled();
    expect(loadWeather).toHaveBeenCalledWith(35.6762, 139.6503);
  });

  it("エラーメッセージを解決する", () => {
    expect(getWeatherErrorMessage(new Error("fail"))).toBe("fail");
    expect(getWeatherErrorMessage("x")).toBe(WEATHER_STATUS_MESSAGES.fetchError);
  });
});
