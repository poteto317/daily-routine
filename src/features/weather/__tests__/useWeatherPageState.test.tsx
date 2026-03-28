import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock("../weather-api", () => ({ fetchWeatherData: jest.fn() }));
jest.mock("../weather-cache", () => ({
  cacheWeatherData: jest.fn(),
  clearPreferredWeatherLocation: jest.fn(),
  getCachedWeatherData: jest.fn(() => null),
  getPreferredWeatherLocation: jest.fn(() => null),
  savePreferredWeatherLocation: jest.fn(),
}));
jest.mock("../page/geolocation", () => ({
  getUserLocation: jest.fn(),
}));

import * as weatherApi from "../weather-api";
import * as weatherCache from "../weather-cache";
import * as geolocation from "../page/geolocation";
import { useWeatherPageState } from "../page/useWeatherPageState";
import { WEATHER_STATUS_MESSAGES } from "../texts";

const mockFetchWeatherData = weatherApi.fetchWeatherData as jest.MockedFunction<
  typeof weatherApi.fetchWeatherData
>;
const mockGetCachedWeatherData =
  weatherCache.getCachedWeatherData as jest.MockedFunction<
    typeof weatherCache.getCachedWeatherData
  >;
const mockGetPreferredWeatherLocation =
  weatherCache.getPreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.getPreferredWeatherLocation
  >;
const mockSavePreferredWeatherLocation =
  weatherCache.savePreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.savePreferredWeatherLocation
  >;
const mockClearPreferredWeatherLocation =
  weatherCache.clearPreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.clearPreferredWeatherLocation
  >;
const mockGetUserLocation =
  geolocation.getUserLocation as jest.MockedFunction<typeof geolocation.getUserLocation>;

describe("useWeatherPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCachedWeatherData.mockReturnValue(null);
    mockGetPreferredWeatherLocation.mockReturnValue(null);
    mockFetchWeatherData.mockResolvedValue({
      location: "東京",
      lastUpdated: "2026-02-13T00:00:00.000Z",
      forecasts: [],
      hourly: [],
    });
  });

  it("初期ロードで東京の天気を取得する", async () => {
    const { result } = renderHook(() => useWeatherPageState());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchWeatherData).toHaveBeenCalledWith(35.6762, 139.6503, true);
    expect(result.current.weatherData?.location).toBe("東京");
  });

  it("キャッシュがあるとそれを使って初期化する", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockGetCachedWeatherData.mockReturnValue({
      location: "cached",
      lastUpdated: "2026-02-13T00:00:00.000Z",
      forecasts: [],
      hourly: [],
    });

    const { result } = renderHook(() => useWeatherPageState());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.weatherData?.location).toBe("cached");
    expect(mockFetchWeatherData).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(WEATHER_STATUS_MESSAGES.cacheLoaded);

    logSpy.mockRestore();
  });

  it("初期ロード失敗で error を設定する", async () => {
    mockFetchWeatherData.mockRejectedValue(new Error("fetch failed"));

    const { result } = renderHook(() => useWeatherPageState());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("fetch failed");
    expect(result.current.locationStatus).toBe("");
  });

  it("現在地を使うと保存して再取得する", async () => {
    mockGetUserLocation.mockResolvedValue({ latitude: 34, longitude: 135 });
    const { result } = renderHook(() => useWeatherPageState());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleUseCurrentLocation();
    });

    expect(mockSavePreferredWeatherLocation).toHaveBeenCalledWith(34, 135);
    expect(mockFetchWeatherData).toHaveBeenCalledWith(34, 135, true);
    expect(result.current.hasPreferredLocation).toBe(true);
  });

  it("現在地リセットで東京に戻す", async () => {
    const { result } = renderHook(() => useWeatherPageState());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleResetPreferredLocation();
    });

    expect(mockClearPreferredWeatherLocation).toHaveBeenCalled();
    expect(mockFetchWeatherData).toHaveBeenCalledWith(35.6762, 139.6503, true);
    expect(result.current.hasPreferredLocation).toBe(false);
  });

  it("現在地リセット失敗で error を設定する", async () => {
    const { result } = renderHook(() => useWeatherPageState());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetchWeatherData.mockRejectedValueOnce(new Error("reset failed"));

    await act(async () => {
      await result.current.handleResetPreferredLocation();
    });

    expect(result.current.error).toBe("reset failed");
    expect(result.current.locationStatus).toBe("");
  });

  it("現在地取得失敗で locationError を設定する", async () => {
    mockGetUserLocation.mockRejectedValue(new Error("geo failed"));
    const { result } = renderHook(() => useWeatherPageState());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleUseCurrentLocation();
    });

    expect(result.current.locationError).toBe(WEATHER_STATUS_MESSAGES.locationError);
  });

  it("clearLocationError で locationError をクリアする", async () => {
    mockGetUserLocation.mockRejectedValue(new Error("geo failed"));
    const { result } = renderHook(() => useWeatherPageState());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleUseCurrentLocation();
    });

    expect(result.current.locationError).toBe(WEATHER_STATUS_MESSAGES.locationError);

    act(() => {
      result.current.clearLocationError();
    });

    expect(result.current.locationError).toBeNull();
  });
});
