import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WeatherPage } from "../../WeatherPage";
import * as weatherApi from "../../weather-api";
import * as weatherCache from "../../weather-cache";

jest.mock("../../weather-api", () => ({ fetchWeatherData: jest.fn() }));
jest.mock("../../weather-cache", () => ({
  getCachedWeatherData: jest.fn(() => null),
  getPreferredWeatherLocation: jest.fn(() => null),
  cacheWeatherData: jest.fn(),
  clearPreferredWeatherLocation: jest.fn(),
  savePreferredWeatherLocation: jest.fn(),
}));

const mockFetchWeatherData = weatherApi.fetchWeatherData as jest.MockedFunction<
  typeof weatherApi.fetchWeatherData
>;
const mockGetCachedWeatherData =
  weatherCache.getCachedWeatherData as jest.MockedFunction<
    typeof weatherCache.getCachedWeatherData
  >;
const mockCacheWeatherData =
  weatherCache.cacheWeatherData as jest.MockedFunction<
    typeof weatherCache.cacheWeatherData
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

describe("WeatherPage current location", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCachedWeatherData.mockReturnValue(null);
    mockGetPreferredWeatherLocation.mockReturnValue(null);
    mockFetchWeatherData.mockResolvedValue({
      location: "東京",
      lastUpdated: "2026-02-13T00:00:00.000Z",
      forecasts: [
        {
          date: "2026-02-13",
          dayOfWeek: "金",
          weather: "sunny",
          temperature: { high: 10, low: 2 },
          precipitation: 0,
          description: "快晴です。",
        },
      ],
      hourly: [],
    });
  });

  it("現在地を使用ボタン押下時のみ位置情報を要求する", async () => {
    const getCurrentPosition = jest.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: 34,
          longitude: 135,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });

    render(<WeatherPage />);

    await waitFor(() => {
      expect(mockFetchWeatherData).toHaveBeenCalledWith(
        35.6762,
        139.6503,
        true,
      );
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "現在地を使用" }),
    );

    await waitFor(() => {
      expect(getCurrentPosition).toHaveBeenCalledTimes(1);
      expect(mockFetchWeatherData).toHaveBeenCalledWith(34, 135, true);
      expect(mockCacheWeatherData).toHaveBeenCalledWith(
        expect.any(Object),
        34,
        135,
      );
      expect(mockSavePreferredWeatherLocation).toHaveBeenCalledWith(34, 135);
    });
  });

  it("保存済み現在地をリセットすると東京の天気に戻る", async () => {
    mockGetPreferredWeatherLocation.mockReturnValue({
      latitude: 34,
      longitude: 135,
    });

    render(<WeatherPage />);

    await waitFor(() => {
      expect(mockFetchWeatherData).toHaveBeenCalledWith(34, 135, true);
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "現在地をリセット" }),
    );

    await waitFor(() => {
      expect(mockClearPreferredWeatherLocation).toHaveBeenCalledTimes(1);
      expect(mockFetchWeatherData).toHaveBeenCalledWith(35.6762, 139.6503, true);
    });
  });
});
