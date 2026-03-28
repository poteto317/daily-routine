import { act, renderHook } from "@testing-library/react";

jest.mock("../weather-cache", () => ({
  savePreferredWeatherLocation: jest.fn(),
}));

jest.mock("../page/geolocation", () => ({
  getUserLocation: jest.fn(),
}));

jest.mock("../page/pageStateActions", () => ({
  loadCurrentLocationWeather: jest.fn(),
}));

jest.mock("../page/viewStateActions", () => ({
  createCurrentLocationErrorState: jest.fn(),
  createLocationWeatherStartState: jest.fn(),
  createLocationWeatherSuccessState: jest.fn(),
}));

import * as weatherCache from "../weather-cache";
import { WEATHER_STATUS_MESSAGES } from "../texts";
import { loadCurrentLocationWeather } from "../page/pageStateActions";
import {
  createCurrentLocationErrorState,
  createLocationWeatherStartState,
  createLocationWeatherSuccessState,
} from "../page/viewStateActions";
import { useWeatherCurrentLocationAction } from "../page/useWeatherCurrentLocationAction";

describe("useWeatherCurrentLocationAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createLocationWeatherStartState as jest.Mock).mockReturnValue({
      isLocationLoading: true,
    });
    (createLocationWeatherSuccessState as jest.Mock).mockImplementation(
      (result) => ({ weatherData: result.weatherData }),
    );
    (createCurrentLocationErrorState as jest.Mock).mockImplementation(
      (message) => ({ locationError: message }),
    );
  });

  it("現在地 handler で start/success patch と依存関数を組み立てる", async () => {
    const applyViewState = jest.fn();
    const loadWeatherByCoordinates = jest.fn();
    const setLocationStatus = jest.fn();
    const resultState = {
      weatherData: {
        location: "大阪",
        lastUpdated: "2026-02-13T00:00:00.000Z",
        forecasts: [],
        hourly: [],
      },
      hasPreferredLocation: true,
      locationStatus: WEATHER_STATUS_MESSAGES.currentLocation,
    };
    (loadCurrentLocationWeather as jest.Mock).mockResolvedValue(resultState);

    const { result } = renderHook(() =>
      useWeatherCurrentLocationAction({
        applyViewState,
        loadWeatherByCoordinates,
        setLocationStatus,
      }),
    );

    await act(async () => {
      await result.current();
    });

    expect(createLocationWeatherStartState).toHaveBeenCalled();
    expect(loadCurrentLocationWeather).toHaveBeenCalledWith({
      getUserLocation: expect.any(Function),
      setLocationStatus,
      savePreferredWeatherLocation: weatherCache.savePreferredWeatherLocation,
      loadWeatherByCoordinates,
    });
    expect(createLocationWeatherSuccessState).toHaveBeenCalledWith(resultState);
    expect(applyViewState).toHaveBeenNthCalledWith(1, {
      isLocationLoading: true,
    });
    expect(applyViewState).toHaveBeenLastCalledWith({
      weatherData: resultState.weatherData,
    });
  });

  it("現在地 handler 失敗時は locationError patch を適用する", async () => {
    const applyViewState = jest.fn();
    (loadCurrentLocationWeather as jest.Mock).mockRejectedValue(
      new Error("geo"),
    );

    const { result } = renderHook(() =>
      useWeatherCurrentLocationAction({
        applyViewState,
        loadWeatherByCoordinates: jest.fn(),
        setLocationStatus: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current();
    });

    expect(createCurrentLocationErrorState).toHaveBeenCalledWith(
      WEATHER_STATUS_MESSAGES.locationError,
    );
    expect(applyViewState).toHaveBeenLastCalledWith({
      locationError: WEATHER_STATUS_MESSAGES.locationError,
    });
  });
});
