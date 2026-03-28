import { WeatherForecast } from "@/types/routine";
import { WEATHER_DESCRIPTIONS } from "../texts";

export const mapWeatherCodeToType = (
  code: number,
): WeatherForecast["weather"] => {
  if (code === 0) return "sunny";
  if (code >= 1 && code <= 3) return code === 1 ? "partly-cloudy" : "cloudy";
  if (code >= 71 && code <= 77) return "snowy";
  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99)
  ) {
    return "rainy";
  }
  return "partly-cloudy";
};

export const getWeatherDescription = (
  weather: WeatherForecast["weather"],
): string => {
  switch (weather) {
    case "sunny":
      return WEATHER_DESCRIPTIONS.sunny;
    case "partly-cloudy":
      return WEATHER_DESCRIPTIONS.partlyCloudy;
    case "cloudy":
      return WEATHER_DESCRIPTIONS.cloudy;
    case "rainy":
      return WEATHER_DESCRIPTIONS.rainy;
    case "snowy":
      return WEATHER_DESCRIPTIONS.snowy;
    default:
      return "";
  }
};
