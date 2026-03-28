import { useMemo } from "react";
import { WeatherPageState } from "./types";
import { createWeatherPageLoadAction } from "./weatherPageLoadAction";
import { createWeatherPageStateResult } from "./weatherPageStateResult";
import { useInitialWeatherState } from "./useInitialWeatherState";
import { useWeatherLocationState } from "./useWeatherLocationState";

export const useWeatherPageState = (): WeatherPageState => {
  const loadWeather = useMemo(() => createWeatherPageLoadAction(), []);
  const { applyViewState, viewState } = useInitialWeatherState({
    loadWeatherByCoordinates: loadWeather,
  });
  const locationState = useWeatherLocationState({
    applyViewState,
    loadWeatherByCoordinates: loadWeather,
  });

  return createWeatherPageStateResult({
    weatherData: viewState.weatherData,
    isLoading: viewState.isLoading,
    isLocationLoading: viewState.isLocationLoading,
    hasPreferredLocation: viewState.hasPreferredLocation,
    error: viewState.error,
    locationError: viewState.locationError,
    locationStatus: viewState.locationStatus,
    clearLocationError: locationState.clearLocationError,
    handleUseCurrentLocation: locationState.handleUseCurrentLocation,
    handleResetPreferredLocation: locationState.handleResetPreferredLocation,
  });
};
