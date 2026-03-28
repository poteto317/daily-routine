import { useCallback } from "react";
import type { WeatherPageState } from "./types";
import { createWeatherLocationActionHandlersResult } from "./weatherLocationActionHandlersResult";
import { createLocationErrorClearedState } from "./viewStateActions";
import { useWeatherCurrentLocationAction } from "./useWeatherCurrentLocationAction";
import { useWeatherResetPreferredLocationAction } from "./useWeatherResetPreferredLocationAction";

type WeatherLocationViewState = Omit<
  WeatherPageState,
  | "clearLocationError"
  | "handleUseCurrentLocation"
  | "handleResetPreferredLocation"
>;

type UseWeatherLocationActionHandlersArgs = {
  applyViewState: (patch: Partial<WeatherLocationViewState>) => void;
  loadWeatherByCoordinates: (
    latitude: number,
    longitude: number,
  ) => Promise<NonNullable<WeatherPageState["weatherData"]>>;
};

export const useWeatherLocationActionHandlers = ({
  applyViewState,
  loadWeatherByCoordinates,
}: UseWeatherLocationActionHandlersArgs) => {
  const updateLocationStatus = useCallback(
    (locationStatus: string) => {
      applyViewState({ locationStatus });
    },
    [applyViewState],
  );

  const handleUseCurrentLocation = useWeatherCurrentLocationAction({
    applyViewState,
    loadWeatherByCoordinates,
    setLocationStatus: updateLocationStatus,
  });
  const handleResetPreferredLocation = useWeatherResetPreferredLocationAction({
    applyViewState,
    loadWeatherByCoordinates,
  });

  const clearLocationError = useCallback(() => {
    applyViewState(createLocationErrorClearedState());
  }, [applyViewState]);

  return createWeatherLocationActionHandlersResult({
    clearLocationError,
    handleResetPreferredLocation,
    handleUseCurrentLocation,
  });
};
