import { WeatherData } from "../api";

export interface CachedWeatherData extends WeatherData {
  latitude: number;
  longitude: number;
  timestamp: number;
}
