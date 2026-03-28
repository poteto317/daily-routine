import type { WeatherPageState } from "./types";

type WeatherPageStateResultArgs = WeatherPageState;

export const createWeatherPageStateResult = ({
  clearLocationError,
  error,
  handleResetPreferredLocation,
  handleUseCurrentLocation,
  hasPreferredLocation,
  isLoading,
  isLocationLoading,
  locationError,
  locationStatus,
  weatherData,
}: WeatherPageStateResultArgs): WeatherPageState => {
  return {
    weatherData,
    isLoading,
    isLocationLoading,
    hasPreferredLocation,
    error,
    locationError,
    locationStatus,
    clearLocationError,
    handleUseCurrentLocation,
    handleResetPreferredLocation,
  };
};
