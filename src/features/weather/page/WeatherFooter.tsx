import { formatWeatherFooterText } from "../helpers";

interface WeatherFooterProps {
  lastUpdated: string;
}

export const WeatherFooter = ({ lastUpdated }: WeatherFooterProps) => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-300">
      <p className="text-xs text-gray-500 dark:text-gray-600 text-center">
        {formatWeatherFooterText(lastUpdated)}
      </p>
    </div>
  );
};
