import type { HourlyWeatherForecast, WeatherForecast } from "@/types/routine";
import { WEATHER_DAY_NAMES } from "../texts";
import type { OpenMeteoResponse } from "./types";
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
  if (!data.hourly) return undefined;

  return data.hourly.time.map((timeStr, index) => ({
    time: timeStr,
    weather: mapWeatherCodeToType(data.hourly!.weather_code[index]),
    temperature: Math.round(data.hourly!.temperature_2m[index]),
    precipitation: data.hourly!.precipitation_probability[index] || 0,
    humidity: Math.round(data.hourly!.relative_humidity_2m[index]),
    windSpeed: Math.round(data.hourly!.wind_speed_10m[index]),
  }));
};
