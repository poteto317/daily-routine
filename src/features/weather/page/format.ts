import { type WeatherForecast } from "@/types/routine";
import { WEATHER_LABELS } from "../texts";

export const getWeatherIcon = (weather: WeatherForecast["weather"]) => {
  switch (weather) {
    case "sunny":
      return "☀️";
    case "partly-cloudy":
      return "⛅";
    case "cloudy":
      return "☁️";
    case "rainy":
      return "🌧️";
    case "snowy":
      return "❄️";
    default:
      return "🌤️";
  }
};

export const getWeatherLabel = (weather: WeatherForecast["weather"]) => {
  switch (weather) {
    case "sunny":
      return WEATHER_LABELS.sunny;
    case "partly-cloudy":
      return WEATHER_LABELS.partlyCloudy;
    case "cloudy":
      return WEATHER_LABELS.cloudy;
    case "rainy":
      return WEATHER_LABELS.rainy;
    case "snowy":
      return WEATHER_LABELS.snowy;
    default:
      return WEATHER_LABELS.sunny;
  }
};

export const formatDate = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const formatHourlyTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return `${date.getHours()}:00`;
};

export const isToday = (dateStr: string) => {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
};
