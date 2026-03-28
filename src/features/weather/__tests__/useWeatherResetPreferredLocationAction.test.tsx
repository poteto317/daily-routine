import { act, renderHook } from "@testing-library/react";

jest.mock("../weather-cache", () => ({
  clearPreferredWeatherLocation: jest.fn(),
}));

jest.mock("../page/pageStateActions", () => ({
  getWeatherErrorMessage: jest.fn(),
  resetPreferredLocationAndLoad: jest.fn(),
}));

jest.mock("../page/viewStateActions", () => ({
  createLocationWeatherStartState: jest.fn(),
  createLocationWeatherSuccessState: jest.fn(),
  createPreferredLocationResetErrorState: jest.fn(),
}));

import * as weatherCache from "../weather-cache";
import {
  getWeatherErrorMessage,
  resetPreferredLocationAndLoad,
} from "../page/pageStateActions";
import {
  createLocationWeatherStartState,
  createLocationWeatherSuccessState,
  createPreferredLocationResetErrorState,
} from "../page/viewStateActions";
import { useWeatherResetPreferredLocationAction } from "../page/useWeatherResetPreferredLocationAction";

describe("useWeatherResetPreferredLocationAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createLocationWeatherStartState as jest.Mock).mockReturnValue({
      isLocationLoading: true,
    });
    (createLocationWeatherSuccessState as jest.Mock).mockImplementation(
      (result) => ({ weatherData: result.weatherData }),
    );
    (createPreferredLocationResetErrorState as jest.Mock).mockImplementation(
      (message) => ({ error: message }),
    );
    (getWeatherErrorMessage as jest.Mock).mockReturnValue("reset failed");
  });

  it("リセット handler で success/error patch を切り替える", async () => {
    const applyViewState = jest.fn();
    const loadWeatherByCoordinates = jest.fn();
    const resetResult = {
      weatherData: {
        location: "東京",
        lastUpdated: "2026-02-13T00:00:00.000Z",
        forecasts: [],
        hourly: [],
      },
      hasPreferredLocation: false,
      locationStatus: "reset",
    };
    (resetPreferredLocationAndLoad as jest.Mock)
      .mockResolvedValueOnce(resetResult)
      .mockRejectedValueOnce(new Error("reset"));

    const { result } = renderHook(() =>
      useWeatherResetPreferredLocationAction({
        applyViewState,
        loadWeatherByCoordinates,
      }),
    );

    await act(async () => {
      await result.current();
    });

    expect(resetPreferredLocationAndLoad).toHaveBeenCalledWith({
      clearPreferredWeatherLocation: weatherCache.clearPreferredWeatherLocation,
      loadWeatherByCoordinates,
    });
    expect(createLocationWeatherSuccessState).toHaveBeenCalledWith(resetResult);

    await act(async () => {
      await result.current();
    });

    expect(getWeatherErrorMessage).toHaveBeenCalledWith(expect.any(Error));
    expect(createPreferredLocationResetErrorState).toHaveBeenCalledWith(
      "reset failed",
    );
  });
});
