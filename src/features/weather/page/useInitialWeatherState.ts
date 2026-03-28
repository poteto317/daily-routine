import { useEffect, useState } from "react";
import {
  getCachedWeatherData,
  getPreferredWeatherLocation,
} from "../weather-cache";
import { WEATHER_STATUS_MESSAGES } from "../texts";
import {
  getWeatherErrorMessage,
  loadInitialWeatherState,
} from "./pageStateActions";
import {
  createInitialWeatherErrorState,
  createInitialWeatherPageState,
  createInitialWeatherSuccessState,
} from "./viewStateActions";

type WeatherViewState = ReturnType<typeof createInitialWeatherPageState>;

type UseInitialWeatherStateArgs = {
  loadWeatherByCoordinates: (
    latitude: number,
    longitude: number,
  ) => Promise<NonNullable<WeatherViewState["weatherData"]>>;
};

export const useInitialWeatherState = ({
  loadWeatherByCoordinates,
}: UseInitialWeatherStateArgs) => {
  const [viewState, setViewState] = useState(createInitialWeatherPageState);

  const applyViewState = (patch: Partial<WeatherViewState>) => {
    setViewState((current) => ({ ...current, ...patch }));
  };

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        const result = await loadInitialWeatherState({
          preferredLocation: getPreferredWeatherLocation(),
          getCachedWeatherData,
          loadWeatherByCoordinates,
        });

        applyViewState(createInitialWeatherSuccessState(result));

        if (result.fromCache) {
          console.log(WEATHER_STATUS_MESSAGES.cacheLoaded);
        }
      } catch (err) {
        applyViewState(
          createInitialWeatherErrorState(getWeatherErrorMessage(err)),
        );
      }
    };

    loadWeatherData();
  }, [loadWeatherByCoordinates]);

  return {
    applyViewState,
    viewState,
  };
};
