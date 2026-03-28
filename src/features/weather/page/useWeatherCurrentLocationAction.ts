import { useCallback } from "react";
import { savePreferredWeatherLocation } from "../weather-cache";
import { WEATHER_STATUS_MESSAGES } from "../texts";
import { getUserLocation } from "./geolocation";
import { loadCurrentLocationWeather } from "./pageStateActions";
import type { WeatherPageState } from "./types";
import {
  createCurrentLocationErrorState,
  createLocationWeatherStartState,
  createLocationWeatherSuccessState,
} from "./viewStateActions";

type WeatherLocationViewState = Omit<
  WeatherPageState,
  | "clearLocationError"
  | "handleUseCurrentLocation"
  | "handleResetPreferredLocation"
>;

type UseWeatherCurrentLocationActionArgs = {
  applyViewState: (patch: Partial<WeatherLocationViewState>) => void;
  loadWeatherByCoordinates: (
    latitude: number,
    longitude: number,
  ) => Promise<NonNullable<WeatherPageState["weatherData"]>>;
  setLocationStatus: (locationStatus: string) => void;
};

export const useWeatherCurrentLocationAction = ({
  applyViewState,
  loadWeatherByCoordinates,
  setLocationStatus,
}: UseWeatherCurrentLocationActionArgs) => {
  return useCallback(async () => {
    applyViewState(createLocationWeatherStartState());

    try {
      const result = await loadCurrentLocationWeather({
        getUserLocation,
        setLocationStatus,
        savePreferredWeatherLocation,
        loadWeatherByCoordinates,
      });

      applyViewState(createLocationWeatherSuccessState(result));
    } catch {
      applyViewState(
        createCurrentLocationErrorState(WEATHER_STATUS_MESSAGES.locationError),
      );
    }
  }, [applyViewState, loadWeatherByCoordinates, setLocationStatus]);
};
