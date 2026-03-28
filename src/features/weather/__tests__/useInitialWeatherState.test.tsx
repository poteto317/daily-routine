import { renderHook, waitFor } from "@testing-library/react";

jest.mock("../weather-cache", () => ({
  getCachedWeatherData: jest.fn(() => null),
  getPreferredWeatherLocation: jest.fn(() => null),
}));

import * as weatherCache from "../weather-cache";
import { useInitialWeatherState } from "../page/useInitialWeatherState";
import { WEATHER_STATUS_MESSAGES } from "../texts";

const mockGetCachedWeatherData =
  weatherCache.getCachedWeatherData as jest.MockedFunction<
    typeof weatherCache.getCachedWeatherData
  >;
const mockGetPreferredWeatherLocation =
  weatherCache.getPreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.getPreferredWeatherLocation
  >;

describe("useInitialWeatherState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCachedWeatherData.mockReturnValue(null);
    mockGetPreferredWeatherLocation.mockReturnValue(null);
  });

  it("優先地点がなければ東京の天気を初期ロードする", async () => {
    const loadWeatherByCoordinates = jest.fn().mockResolvedValue({
      location: "東京",
      lastUpdated: "2026-02-13T00:00:00.000Z",
      forecasts: [],
      hourly: [],
    });

    const { result } = renderHook(() =>
      useInitialWeatherState({ loadWeatherByCoordinates }),
    );

    await waitFor(() => {
      expect(result.current.viewState.isLoading).toBe(false);
    });

    expect(loadWeatherByCoordinates).toHaveBeenCalledWith(35.6762, 139.6503);
    expect(result.current.viewState.weatherData?.location).toBe("東京");
  });

  it("キャッシュがあればそれを使い、cacheLoaded を出す", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockGetCachedWeatherData.mockReturnValue({
      location: "cached",
      lastUpdated: "2026-02-13T00:00:00.000Z",
      forecasts: [],
      hourly: [],
    });
    const loadWeatherByCoordinates = jest.fn();

    const { result } = renderHook(() =>
      useInitialWeatherState({ loadWeatherByCoordinates }),
    );

    await waitFor(() => {
      expect(result.current.viewState.isLoading).toBe(false);
    });

    expect(loadWeatherByCoordinates).not.toHaveBeenCalled();
    expect(result.current.viewState.weatherData?.location).toBe("cached");
    expect(logSpy).toHaveBeenCalledWith(WEATHER_STATUS_MESSAGES.cacheLoaded);
    logSpy.mockRestore();
  });

  it("初期ロード失敗時に error を設定する", async () => {
    const loadWeatherByCoordinates = jest
      .fn()
      .mockRejectedValue(new Error("fetch failed"));

    const { result } = renderHook(() =>
      useInitialWeatherState({ loadWeatherByCoordinates }),
    );

    await waitFor(() => {
      expect(result.current.viewState.isLoading).toBe(false);
    });

    expect(result.current.viewState.error).toBe("fetch failed");
    expect(result.current.viewState.locationStatus).toBe("");
  });
});
