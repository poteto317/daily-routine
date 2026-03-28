import { ErrorAlert } from "@/components";
import { WEATHER_ERROR_STATE_TEXT } from "../texts";
import { WeatherPanel } from "./WeatherPanel";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <WeatherPanel>
      <ErrorAlert
        error={`${WEATHER_ERROR_STATE_TEXT.icon} ${WEATHER_ERROR_STATE_TEXT.title}: ${error}`}
        onRetry={onRetry}
        retryButtonText={WEATHER_ERROR_STATE_TEXT.reload}
      />
    </WeatherPanel>
  );
};
