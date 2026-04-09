import { buildForecastUrl } from "./request";
import { getLocationName } from "./location";
import { mapDailyForecasts, mapHourlyForecasts } from "./mapForecasts";
import { type OpenMeteoResponse, type WeatherData } from "./types";
import { getWeatherFetchErrorMessage } from "./error";

export const fetchWeatherData = async (
  latitude: number = 35.6762,
  longitude: number = 139.6503,
  includeHourly: boolean = false,
): Promise<WeatherData> => {
  const response = await fetch(
    buildForecastUrl(latitude, longitude, includeHourly),
  );
  if (!response.ok)
    throw new Error(getWeatherFetchErrorMessage(response.status));

  const data: OpenMeteoResponse = await response.json();
  const [locationName, forecasts] = await Promise.all([
    getLocationName(latitude, longitude),
    Promise.resolve(mapDailyForecasts(data)),
  ]);

  return {
    location: locationName,
    lastUpdated: new Date().toISOString(),
    forecasts,
    hourly: includeHourly ? mapHourlyForecasts(data) : undefined,
  };
};
