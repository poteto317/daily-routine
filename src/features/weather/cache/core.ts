import type { WeatherData } from "../api";
import {
  LOCATION_DIFF_THRESHOLD,
  WEATHER_CACHE_DURATION,
  WEATHER_CACHE_KEY,
  WEATHER_PREFERRED_LOCATION_KEY,
} from "./constants";
import type { CachedWeatherData } from "./types";
import { WEATHER_CONSOLE_MESSAGES } from "../texts";

type PreferredWeatherLocation = {
  latitude: number;
  longitude: number;
};

export const cacheWeatherData = (
  data: WeatherData,
  latitude: number,
  longitude: number,
): void => {
  try {
    const cacheData: CachedWeatherData = {
      ...data,
      latitude,
      longitude,
      timestamp: Date.now(),
    };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn(WEATHER_CONSOLE_MESSAGES.cacheSaveFailed, error);
  }
};

export const getCachedWeatherData = (
  latitude?: number,
  longitude?: number,
): WeatherData | null => {
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;

    const data: CachedWeatherData = JSON.parse(cached);
    if (Date.now() - data.timestamp > WEATHER_CACHE_DURATION) {
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }

    if (latitude !== undefined && longitude !== undefined) {
      const latDiff = Math.abs(data.latitude - latitude);
      const lonDiff = Math.abs(data.longitude - longitude);
      if (
        latDiff > LOCATION_DIFF_THRESHOLD ||
        lonDiff > LOCATION_DIFF_THRESHOLD
      ) {
        return null;
      }
    }

    return {
      location: data.location,
      lastUpdated: data.lastUpdated,
      forecasts: data.forecasts,
      hourly: data.hourly,
    };
  } catch (error) {
    console.warn(WEATHER_CONSOLE_MESSAGES.cacheLoadFailed, error);
    return null;
  }
};

export const clearWeatherCache = (): void => {
  try {
    localStorage.removeItem(WEATHER_CACHE_KEY);
  } catch (error) {
    console.warn(WEATHER_CONSOLE_MESSAGES.cacheClearFailed, error);
  }
};

export const savePreferredWeatherLocation = (
  latitude: number,
  longitude: number,
): void => {
  try {
    const preferredLocation: PreferredWeatherLocation = { latitude, longitude };
    localStorage.setItem(
      WEATHER_PREFERRED_LOCATION_KEY,
      JSON.stringify(preferredLocation),
    );
  } catch (error) {
    console.warn(WEATHER_CONSOLE_MESSAGES.preferredLocationSaveFailed, error);
  }
};

export const getPreferredWeatherLocation =
  (): PreferredWeatherLocation | null => {
    try {
      const stored = localStorage.getItem(WEATHER_PREFERRED_LOCATION_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored) as Partial<PreferredWeatherLocation>;
      if (
        typeof parsed.latitude !== "number" ||
        typeof parsed.longitude !== "number"
      ) {
        localStorage.removeItem(WEATHER_PREFERRED_LOCATION_KEY);
        return null;
      }

      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      };
    } catch (error) {
      console.warn(WEATHER_CONSOLE_MESSAGES.preferredLocationLoadFailed, error);
      return null;
    }
  };

export const clearPreferredWeatherLocation = (): void => {
  try {
    localStorage.removeItem(WEATHER_PREFERRED_LOCATION_KEY);
  } catch (error) {
    console.warn(WEATHER_CONSOLE_MESSAGES.preferredLocationClearFailed, error);
  }
};
