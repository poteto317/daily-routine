import type { WeatherPageState } from "./types";

type WeatherPageViewState = Omit<
  WeatherPageState,
  "clearLocationError" | "handleUseCurrentLocation" | "handleResetPreferredLocation"
>;

type WeatherLoadResult = {
  weatherData: WeatherPageViewState["weatherData"];
  hasPreferredLocation: boolean;
  locationStatus: string;
  fromCache?: boolean;
};

export const createInitialWeatherPageState = (): WeatherPageViewState => {
  return {
    weatherData: null,
    isLoading: true,
    isLocationLoading: false,
    hasPreferredLocation: false,
    error: null,
    locationError: null,
    locationStatus: "",
  };
};

export const createLocationWeatherStartState = (): Partial<WeatherPageViewState> => {
  return {
    error: null,
    locationError: null,
    isLocationLoading: true,
  };
};

export const createInitialWeatherSuccessState = (
  result: WeatherLoadResult,
): Partial<WeatherPageViewState> => {
  return {
    weatherData: result.weatherData,
    hasPreferredLocation: result.hasPreferredLocation,
    locationStatus: result.fromCache ? "" : result.locationStatus,
    error: null,
    isLoading: false,
  };
};

export const createInitialWeatherErrorState = (
  message: string,
): Partial<WeatherPageViewState> => {
  return {
    error: message,
    locationStatus: "",
    isLoading: false,
  };
};

export const createLocationWeatherSuccessState = (
  result: WeatherLoadResult,
): Partial<WeatherPageViewState> => {
  return {
    weatherData: result.weatherData,
    hasPreferredLocation: result.hasPreferredLocation,
    locationStatus: result.locationStatus,
    isLocationLoading: false,
  };
};

export const createCurrentLocationErrorState = (
  message: string,
): Partial<WeatherPageViewState> => {
  return {
    locationStatus: "",
    locationError: message,
    isLocationLoading: false,
  };
};

export const createPreferredLocationResetErrorState = (
  message: string,
): Partial<WeatherPageViewState> => {
  return {
    error: message,
    locationStatus: "",
    isLocationLoading: false,
  };
};

export const createLocationErrorClearedState = (): Partial<WeatherPageViewState> => {
  return {
    locationError: null,
  };
};
