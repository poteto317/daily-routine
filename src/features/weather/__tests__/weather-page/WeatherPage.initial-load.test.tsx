import { render, waitFor } from "@testing-library/react";
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
const mockGetPreferredWeatherLocation =
  weatherCache.getPreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.getPreferredWeatherLocation
  >;

describe("WeatherPage initial load", () => {
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

  it("初期表示では位置情報を要求せず東京の天気を読み込む", async () => {
    const getCurrentPosition = jest.fn();
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
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("保存済みの優先地点がある場合は起動時にその地点を読み込む", async () => {
    mockGetPreferredWeatherLocation.mockReturnValue({
      latitude: 34,
      longitude: 135,
    });

    render(<WeatherPage />);

    await waitFor(() => {
      expect(mockFetchWeatherData).toHaveBeenCalledWith(34, 135, true);
      expect(mockFetchWeatherData).not.toHaveBeenCalledWith(
        35.6762,
        139.6503,
        true,
      );
    });
  });
});
