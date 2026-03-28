import { renderHook } from "@testing-library/react";

jest.mock("../page/weatherPageLoadAction", () => ({
  createWeatherPageLoadAction: jest.fn(),
}));

jest.mock("../page/weatherPageStateResult", () => ({
  createWeatherPageStateResult: jest.fn(),
}));

jest.mock("../page/useInitialWeatherState", () => ({
  useInitialWeatherState: jest.fn(),
}));

jest.mock("../page/useWeatherLocationState", () => ({
  useWeatherLocationState: jest.fn(),
}));

import { createWeatherPageLoadAction } from "../page/weatherPageLoadAction";
import { createWeatherPageStateResult } from "../page/weatherPageStateResult";
import { useInitialWeatherState } from "../page/useInitialWeatherState";
import { useWeatherLocationState } from "../page/useWeatherLocationState";
import { useWeatherPageState } from "../page/useWeatherPageState";

describe("useWeatherPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const loadWeather = jest.fn();
    (createWeatherPageLoadAction as jest.Mock).mockReturnValue(loadWeather);
    (useInitialWeatherState as jest.Mock).mockReturnValue({
      applyViewState: jest.fn(),
      viewState: {
        weatherData: null,
        isLoading: false,
        isLocationLoading: false,
        hasPreferredLocation: false,
        error: null,
        locationError: null,
        locationStatus: "東京の天気を表示中",
      },
    });
    (useWeatherLocationState as jest.Mock).mockReturnValue({
      clearLocationError: jest.fn(),
      handleResetPreferredLocation: jest.fn(),
      handleUseCurrentLocation: jest.fn(),
    });
    (createWeatherPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("load action / initial state / location state / result を compose する", () => {
    const { result } = renderHook(() => useWeatherPageState());

    expect(createWeatherPageLoadAction).toHaveBeenCalledTimes(1);
    expect(useInitialWeatherState).toHaveBeenCalledWith({
      loadWeatherByCoordinates: expect.any(Function),
    });
    expect(useWeatherLocationState).toHaveBeenCalledWith({
      applyViewState: expect.any(Function),
      loadWeatherByCoordinates: expect.any(Function),
    });
    expect(createWeatherPageStateResult).toHaveBeenCalledWith({
      weatherData: null,
      isLoading: false,
      isLocationLoading: false,
      hasPreferredLocation: false,
      error: null,
      locationError: null,
      locationStatus: "東京の天気を表示中",
      clearLocationError: expect.any(Function),
      handleUseCurrentLocation: expect.any(Function),
      handleResetPreferredLocation: expect.any(Function),
    });
    expect(result.current).toEqual({ composed: true });
  });
});
