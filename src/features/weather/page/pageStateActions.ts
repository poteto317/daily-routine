import type { WeatherData } from "../api";
import { WEATHER_STATUS_MESSAGES } from "../texts";

export type WeatherCoordinates = {
  latitude: number;
  longitude: number;
};

type FetchWeatherData = (
  latitude: number,
  longitude: number,
  includeHourly: boolean,
) => Promise<WeatherData>;

type CacheWeatherData = (
  data: WeatherData,
  latitude: number,
  longitude: number,
) => void;

type LoadWeatherByCoordinatesArgs = {
  latitude: number;
  longitude: number;
  fetchWeatherData: FetchWeatherData;
  cacheWeatherData: CacheWeatherData;
};

type LoadInitialWeatherStateArgs = {
  preferredLocation: WeatherCoordinates | null;
  getCachedWeatherData: (
    latitude: number,
    longitude: number,
  ) => WeatherData | null;
  loadWeatherByCoordinates: (
    latitude: number,
    longitude: number,
  ) => Promise<WeatherData>;
};

type UseCurrentLocationArgs = {
  getUserLocation: (
    setLocationStatus: (status: string) => void,
  ) => Promise<WeatherCoordinates>;
  setLocationStatus: (status: string) => void;
  savePreferredWeatherLocation: (latitude: number, longitude: number) => void;
  loadWeatherByCoordinates: (
    latitude: number,
    longitude: number,
  ) => Promise<WeatherData>;
};

type ResetPreferredLocationArgs = {
  clearPreferredWeatherLocation: () => void;
  loadWeatherByCoordinates: (
    latitude: number,
    longitude: number,
  ) => Promise<WeatherData>;
};

type InitialWeatherState = {
  weatherData: WeatherData;
  hasPreferredLocation: boolean;
  locationStatus: string;
  fromCache: boolean;
};

type CurrentLocationResult = {
  weatherData: WeatherData;
  hasPreferredLocation: boolean;
  locationStatus: string;
};

type ResetPreferredLocationResult = {
  weatherData: WeatherData;
  hasPreferredLocation: boolean;
  locationStatus: string;
};

export const TOKYO_COORDINATES: WeatherCoordinates = {
  latitude: 35.6762,
  longitude: 139.6503,
};

export const getWeatherErrorMessage = (error: unknown): string => {
  return error instanceof Error
    ? error.message
    : WEATHER_STATUS_MESSAGES.fetchError;
};

export const resolveInitialWeatherCoordinates = (
  preferredLocation: WeatherCoordinates | null,
): WeatherCoordinates => {
  return preferredLocation ?? TOKYO_COORDINATES;
};

export const getInitialLocationStatus = (
  hasPreferredLocation: boolean,
): string => {
  return hasPreferredLocation
    ? WEATHER_STATUS_MESSAGES.currentLocation
    : WEATHER_STATUS_MESSAGES.tokyoLocation;
};

export const loadWeatherByCoordinates = async ({
  latitude,
  longitude,
  fetchWeatherData,
  cacheWeatherData,
}: LoadWeatherByCoordinatesArgs): Promise<WeatherData> => {
  const data = await fetchWeatherData(latitude, longitude, true);
  cacheWeatherData(data, latitude, longitude);
  return data;
};

export const loadInitialWeatherState = async ({
  preferredLocation,
  getCachedWeatherData,
  loadWeatherByCoordinates,
}: LoadInitialWeatherStateArgs): Promise<InitialWeatherState> => {
  const coordinates = resolveInitialWeatherCoordinates(preferredLocation);
  const hasPreferredLocation = Boolean(preferredLocation);
  const cached = getCachedWeatherData(
    coordinates.latitude,
    coordinates.longitude,
  );

  if (cached) {
    return {
      weatherData: cached,
      hasPreferredLocation,
      locationStatus: "",
      fromCache: true,
    };
  }

  const weatherData = await loadWeatherByCoordinates(
    coordinates.latitude,
    coordinates.longitude,
  );

  return {
    weatherData,
    hasPreferredLocation,
    locationStatus: getInitialLocationStatus(hasPreferredLocation),
    fromCache: false,
  };
};

export const loadCurrentLocationWeather = async ({
  getUserLocation,
  setLocationStatus,
  savePreferredWeatherLocation,
  loadWeatherByCoordinates,
}: UseCurrentLocationArgs): Promise<CurrentLocationResult> => {
  const location = await getUserLocation(setLocationStatus);
  savePreferredWeatherLocation(location.latitude, location.longitude);
  const weatherData = await loadWeatherByCoordinates(
    location.latitude,
    location.longitude,
  );

  return {
    weatherData,
    hasPreferredLocation: true,
    locationStatus: WEATHER_STATUS_MESSAGES.currentLocation,
  };
};

export const resetPreferredLocationAndLoad = async ({
  clearPreferredWeatherLocation,
  loadWeatherByCoordinates,
}: ResetPreferredLocationArgs): Promise<ResetPreferredLocationResult> => {
  clearPreferredWeatherLocation();
  const weatherData = await loadWeatherByCoordinates(
    TOKYO_COORDINATES.latitude,
    TOKYO_COORDINATES.longitude,
  );

  return {
    weatherData,
    hasPreferredLocation: false,
    locationStatus: WEATHER_STATUS_MESSAGES.locationReset,
  };
};
