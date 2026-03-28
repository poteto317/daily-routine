import { HourlyWeatherForecast, WeatherForecast } from "@/types/routine";

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: Array<number | null | undefined>;
    weather_code: number[];
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: Array<number | null | undefined>;
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
    weather_code: number[];
  };
}

export interface WeatherData {
  location: string;
  lastUpdated: string;
  forecasts: WeatherForecast[];
  hourly?: HourlyWeatherForecast[];
}
