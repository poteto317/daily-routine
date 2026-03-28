import { createWeatherPageStateResult } from "../page/weatherPageStateResult";

describe("weatherPageStateResult", () => {
  it("weather page の公開 state を組み立てる", () => {
    const clearLocationError = jest.fn();
    const handleResetPreferredLocation = jest.fn();
    const handleUseCurrentLocation = jest.fn();
    const weatherData = {
      location: "東京",
      lastUpdated: "2026-02-13T00:00:00.000Z",
      forecasts: [],
      hourly: [],
    };

    expect(
      createWeatherPageStateResult({
        weatherData,
        isLoading: false,
        isLocationLoading: true,
        hasPreferredLocation: true,
        error: null,
        locationError: null,
        locationStatus: "現在地の天気を表示中",
        clearLocationError,
        handleUseCurrentLocation,
        handleResetPreferredLocation,
      }),
    ).toEqual({
      weatherData,
      isLoading: false,
      isLocationLoading: true,
      hasPreferredLocation: true,
      error: null,
      locationError: null,
      locationStatus: "現在地の天気を表示中",
      clearLocationError,
      handleUseCurrentLocation,
      handleResetPreferredLocation,
    });
  });
});
