import type { WeatherPageState } from "./types";
import { useWeatherLocationActionHandlers } from "./useWeatherLocationActionHandlers";

type WeatherLocationViewState = Omit<
  WeatherPageState,
  | "clearLocationError"
  | "handleUseCurrentLocation"
  | "handleResetPreferredLocation"
>;

type UseWeatherLocationStateArgs = {
  applyViewState: (patch: Partial<WeatherLocationViewState>) => void;
  loadWeatherByCoordinates: (
    latitude: number,
    longitude: number,
  ) => Promise<NonNullable<WeatherPageState["weatherData"]>>;
};

export const useWeatherLocationState = ({
  applyViewState,
  loadWeatherByCoordinates,
}: UseWeatherLocationStateArgs) => {
  return useWeatherLocationActionHandlers({
    applyViewState,
    loadWeatherByCoordinates,
  });
};
