import { WEATHER_STATUS_MESSAGES } from "../texts";

export const getWeatherFetchErrorMessage = (statusCode: number): string => {
  return `${WEATHER_STATUS_MESSAGES.fetchErrorPrefix}: ${statusCode}`;
};
