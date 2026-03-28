import { fetchWeatherData } from "../weather-api";
import { cacheWeatherData } from "../weather-cache";
import { loadWeatherByCoordinates } from "./pageStateActions";

export const createWeatherPageLoadAction = () => {
  return async (latitude: number, longitude: number) => {
    return loadWeatherByCoordinates({
      latitude,
      longitude,
      fetchWeatherData,
      cacheWeatherData,
    });
  };
};
