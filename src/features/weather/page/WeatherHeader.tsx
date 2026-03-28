import {
  getWeatherLocationButtonLabel,
  getWeatherResetLocationButtonLabel,
} from "../helpers";
import { WEATHER_HEADER_TEXT } from "../texts";

interface WeatherHeaderProps {
  location: string;
  isLocationLoading: boolean;
  hasPreferredLocation: boolean;
  onUseCurrentLocation: () => void;
  onResetPreferredLocation: () => void;
}

export const WeatherHeader = ({
  location,
  isLocationLoading,
  hasPreferredLocation,
  onUseCurrentLocation,
  onResetPreferredLocation,
}: WeatherHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {WEATHER_HEADER_TEXT.title}
      </h1>
      <div className="flex items-center gap-3">
        <button
          onClick={onUseCurrentLocation}
          disabled={isLocationLoading}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {getWeatherLocationButtonLabel(isLocationLoading)}
        </button>
        {hasPreferredLocation && (
          <button
            onClick={onResetPreferredLocation}
            disabled={isLocationLoading}
            className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {getWeatherResetLocationButtonLabel()}
          </button>
        )}
        <div className="text-sm text-gray-600 dark:text-gray-700">
          {WEATHER_HEADER_TEXT.locationPrefix} {location}
        </div>
      </div>
    </div>
  );
};
