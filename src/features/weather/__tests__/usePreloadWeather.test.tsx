import React from "react";
import { render, waitFor } from "@testing-library/react";
import { usePreloadWeather } from "../usePreloadWeather";
import * as weatherApi from "../weather-api";
import * as weatherCache from "../weather-cache";

jest.mock("../weather-api", () => ({
  fetchWeatherData: jest.fn(),
}));

jest.mock("../weather-cache", () => ({
  cacheWeatherData: jest.fn(),
  getPreferredWeatherLocation: jest.fn(() => null),
}));

const mockFetchWeatherData = weatherApi.fetchWeatherData as jest.MockedFunction<
  typeof weatherApi.fetchWeatherData
>;
const mockCacheWeatherData =
  weatherCache.cacheWeatherData as jest.MockedFunction<
    typeof weatherCache.cacheWeatherData
  >;

const TestComponent = () => {
  usePreloadWeather();
  return null;
};

describe("usePreloadWeather", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockFetchWeatherData.mockResolvedValue({
      location: "東京",
      lastUpdated: "2026-02-12T00:00:00.000Z",
      forecasts: [],
      hourly: [],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("事前ロードは東京の座標で天気を取得してキャッシュする", async () => {
    render(<TestComponent />);
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockFetchWeatherData).toHaveBeenCalledWith(
        35.6762,
        139.6503,
        true,
      );
      expect(mockCacheWeatherData).toHaveBeenCalledWith(
        expect.objectContaining({ location: "東京" }),
        35.6762,
        139.6503,
      );
    });
  });
});
