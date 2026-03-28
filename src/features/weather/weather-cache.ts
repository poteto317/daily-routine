export {
  cacheWeatherData,
  clearPreferredWeatherLocation,
  clearWeatherCache,
  getPreferredWeatherLocation,
  getCachedWeatherData,
  savePreferredWeatherLocation,
} from "./cache";
export {
  LOCATION_DIFF_THRESHOLD,
  WEATHER_CACHE_DURATION,
  WEATHER_CACHE_KEY,
  WEATHER_PREFERRED_LOCATION_KEY,
} from "./cache";
export type { CachedWeatherData } from "./cache";
