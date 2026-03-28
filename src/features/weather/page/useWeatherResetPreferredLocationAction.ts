import { useCallback } from "react";
import { clearPreferredWeatherLocation } from "../weather-cache";
import {
  getWeatherErrorMessage,
  resetPreferredLocationAndLoad,
} from "./pageStateActions";
import type { WeatherPageState } from "./types";
import {
  createLocationWeatherStartState,
  createLocationWeatherSuccessState,
  createPreferredLocationResetErrorState,
} from "./viewStateActions";

type WeatherLocationViewState = Omit<
  WeatherPageState,
  | "clearLocationError"
  | "handleUseCurrentLocation"
  | "handleResetPreferredLocation"
>;

type UseWeatherResetPreferredLocationActionArgs = {
  applyViewState: (patch: Partial<WeatherLocationViewState>) => void;
  loadWeatherByCoordinates: (
    latitude: number,
    longitude: number,
  ) => Promise<NonNullable<WeatherPageState["weatherData"]>>;
};

export const useWeatherResetPreferredLocationAction = ({
  applyViewState,
  loadWeatherByCoordinates,
}: UseWeatherResetPreferredLocationActionArgs) => {
  return useCallback(async () => {
    applyViewState(createLocationWeatherStartState());

    try {
      const result = await resetPreferredLocationAndLoad({
        clearPreferredWeatherLocation,
        loadWeatherByCoordinates,
      });

      applyViewState(createLocationWeatherSuccessState(result));
    } catch (err) {
      applyViewState(
        createPreferredLocationResetErrorState(getWeatherErrorMessage(err)),
      );
    }
  }, [applyViewState, loadWeatherByCoordinates]);
};
