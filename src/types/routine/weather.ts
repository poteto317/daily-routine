export type WeatherType =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "partly-cloudy";

export interface WeatherForecast {
  date: string;
  dayOfWeek: string;
  weather: WeatherType;
  temperature: {
    high: number;
    low: number;
  };
  precipitation: number;
  description: string;
}

export interface HourlyWeatherForecast {
  time: string;
  weather: WeatherType;
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

export interface WeatherData {
  location: string;
  lastUpdated: string;
  forecasts: WeatherForecast[];
  hourly?: HourlyWeatherForecast[];
}
