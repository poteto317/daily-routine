import { LoadingIndicator } from "@/components";
import { WEATHER_LOADING_STATE_TEXT } from "../texts";
import { WeatherPanel } from "./WeatherPanel";

interface LoadingStateProps {
  locationStatus: string;
}

export const LoadingState = ({ locationStatus }: LoadingStateProps) => {
  return (
    <WeatherPanel>
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator
          message={WEATHER_LOADING_STATE_TEXT.loading}
          subMessage={locationStatus}
          spinnerClassName="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          messageClassName="text-gray-600 dark:text-gray-700"
        />
      </div>
    </WeatherPanel>
  );
};
