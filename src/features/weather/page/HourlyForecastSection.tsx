import { type HourlyWeatherForecast } from "@/types/routine";
import { formatHourlyTime, getWeatherIcon } from "./format";
import { HOURLY_FORECAST_SECTION_TEXT } from "../texts";

interface HourlyForecastSectionProps {
  hourly: HourlyWeatherForecast[];
  selectedDateLabel?: string;
}

export const HourlyForecastSection = ({
  hourly,
  selectedDateLabel,
}: HourlyForecastSectionProps) => {
  if (hourly.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-4">
        {HOURLY_FORECAST_SECTION_TEXT.title}
      </h2>
      {selectedDateLabel && (
        <p className="text-sm text-gray-600 dark:text-gray-700 mb-3">
          {selectedDateLabel}
        </p>
      )}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {hourly.map((hour, index) => (
            <div
              key={index}
              className="shrink-0 w-24 p-3 bg-white dark:bg-slate-50 rounded-lg border border-gray-200 dark:border-gray-300 hover:shadow-md transition-shadow"
            >
              <p className="text-xs text-gray-600 dark:text-gray-700 text-center mb-2 font-medium">
                {formatHourlyTime(hour.time)}
              </p>
              <div className="text-3xl text-center mb-2">
                {getWeatherIcon(hour.weather)}
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-1">
                {hour.temperature}°
              </p>
              <div className="text-xs text-center space-y-1">
                <p className="text-blue-600 dark:text-blue-700">
                  {HOURLY_FORECAST_SECTION_TEXT.precipitationPrefix}{" "}
                  {hour.precipitation}%
                </p>
                <p className="text-gray-600 dark:text-gray-700">
                  {HOURLY_FORECAST_SECTION_TEXT.windPrefix} {hour.windSpeed}
                  {HOURLY_FORECAST_SECTION_TEXT.windUnit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
