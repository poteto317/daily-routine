import { type WeatherForecast } from "@/types/routine";
import { formatDate, getWeatherIcon, getWeatherLabel, isToday } from "./format";
import { WEEKLY_FORECAST_SECTION_TEXT } from "../texts";

interface WeeklyForecastSectionProps {
  forecasts: WeatherForecast[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export const WeeklyForecastSection = ({
  forecasts,
  selectedDate,
  onSelectDate,
}: WeeklyForecastSectionProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-4">
        {WEEKLY_FORECAST_SECTION_TEXT.title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {forecasts.map((forecast) => (
          <button
            key={forecast.date}
            type="button"
            onClick={() => onSelectDate(forecast.date)}
            aria-pressed={selectedDate === forecast.date}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedDate === forecast.date
                ? "bg-blue-100 dark:bg-blue-200 border-blue-500 dark:border-blue-600 shadow-md"
                : isToday(forecast.date)
                  ? "bg-blue-50 dark:bg-blue-100 border-blue-300 dark:border-blue-400 hover:shadow-md"
                  : "bg-white dark:bg-slate-50 border-gray-200 dark:border-gray-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-700">
                  {formatDate(forecast.date)}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-900">
                  {forecast.dayOfWeek}
                  {isToday(forecast.date) && (
                    <span className="ml-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      {WEEKLY_FORECAST_SECTION_TEXT.todayBadge}
                    </span>
                  )}
                </p>
              </div>
              <span className="text-4xl">
                {getWeatherIcon(forecast.weather)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
              {getWeatherLabel(forecast.weather)}
            </p>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-red-600 dark:text-red-700 font-semibold">
                  {forecast.temperature.high}°
                </span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-blue-600 dark:text-blue-700 font-semibold">
                  {forecast.temperature.low}°
                </span>
              </div>
              <span className="text-gray-600 dark:text-gray-700">
                {WEEKLY_FORECAST_SECTION_TEXT.precipitationPrefix}{" "}
                {forecast.precipitation}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
