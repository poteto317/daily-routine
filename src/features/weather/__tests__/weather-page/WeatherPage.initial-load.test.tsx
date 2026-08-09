import { render, waitFor } from "@testing-library/react";
import {
  WeatherPage,
  mockFetchWeatherData,
  mockGetPreferredWeatherLocation,
  setupWeatherPageMocks,
} from "./WeatherPage.test-setup";

describe("WeatherPage initial load", () => {
  beforeEach(() => {
    setupWeatherPageMocks();
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
