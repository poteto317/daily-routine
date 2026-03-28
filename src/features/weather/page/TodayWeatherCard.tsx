import { WeatherForecast } from "@/types/routine";
import { getWeatherIcon, getWeatherLabel } from "./format";
import { TODAY_WEATHER_CARD_TEXT } from "../texts";

interface TodayWeatherCardProps {
  forecast: WeatherForecast;
}

export const TodayWeatherCard = ({ forecast }: TodayWeatherCardProps) => {
  return (
    <div className="bg-linear-to-br from-blue-50 to-sky-50 dark:from-blue-100 dark:to-sky-100 rounded-xl p-6 mb-6 shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-4">
        {TODAY_WEATHER_CARD_TEXT.title}
      </h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-6xl">{getWeatherIcon(forecast.weather)}</span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {getWeatherLabel(forecast.weather)}
            </p>
            <p className="text-gray-600 dark:text-gray-700 mt-1">
              {forecast.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-red-600 dark:text-red-700">
            {forecast.temperature.high}°
          </div>
          <div className="text-2xl text-blue-600 dark:text-blue-700">
            {forecast.temperature.low}°
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-700 mt-2">
            {TODAY_WEATHER_CARD_TEXT.precipitationPrefix}{" "}
            {forecast.precipitation}%
          </div>
        </div>
      </div>
    </div>
  );
};
