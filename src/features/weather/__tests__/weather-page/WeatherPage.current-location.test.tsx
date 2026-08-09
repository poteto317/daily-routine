import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  WeatherPage,
  mockCacheWeatherData,
  mockClearPreferredWeatherLocation,
  mockFetchWeatherData,
  mockGetPreferredWeatherLocation,
  mockSavePreferredWeatherLocation,
  setupWeatherPageMocks,
} from "./WeatherPage.test-setup";

describe("WeatherPage current location", () => {
  beforeEach(() => {
    setupWeatherPageMocks();
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
      expect(mockFetchWeatherData).toHaveBeenCalledWith(
        35.6762,
        139.6503,
        true,
      );
    });
  });
});
