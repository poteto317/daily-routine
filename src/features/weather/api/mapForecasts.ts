import {
  type HourlyWeatherForecast,
  type WeatherForecast,
} from "@/types/routine";
import { WEATHER_DAY_NAMES } from "../texts";
import { type OpenMeteoResponse } from "./types";
import { getWeatherDescription, mapWeatherCodeToType } from "./weatherCode";

export const mapDailyForecasts = (
  data: OpenMeteoResponse,
): WeatherForecast[] => {
  const daysToFetch = Math.min(7, data.daily.time.length);

  return Array.from({ length: daysToFetch }, (_, index) => {
    const dateStr = data.daily.time[index];
    const date = new Date(`${dateStr}T00:00:00`);
    const weather = mapWeatherCodeToType(data.daily.weather_code[index]);

    return {
      date: dateStr,
      dayOfWeek: WEATHER_DAY_NAMES[date.getDay()],
      weather,
      temperature: {
        high: Math.round(data.daily.temperature_2m_max[index]),
        low: Math.round(data.daily.temperature_2m_min[index]),
      },
      precipitation: data.daily.precipitation_probability_max[index] || 0,
      description: getWeatherDescription(weather),
    };
  });
};

export const mapHourlyForecasts = (
  data: OpenMeteoResponse,
): HourlyWeatherForecast[] | undefined => {
  // コールバックの中でも undefined でないことが型で保たれるよう、ローカル変数に取り出す
  const { hourly } = data;
  if (!hourly) return undefined;

  return hourly.time.map((timeStr, index) => ({
    time: timeStr,
    weather: mapWeatherCodeToType(hourly.weather_code[index]),
    temperature: Math.round(hourly.temperature_2m[index]),
    precipitation: hourly.precipitation_probability[index] || 0,
    humidity: Math.round(hourly.relative_humidity_2m[index]),
    windSpeed: Math.round(hourly.wind_speed_10m[index]),
  }));
};
