import { WEATHER_FOOTER_TEXT, WEATHER_HEADER_TEXT } from "./texts";

/**
 * Weather location button label generator
 */
export const getWeatherLocationButtonLabel = (
  isLocationLoading: boolean,
): string =>
  isLocationLoading
    ? WEATHER_HEADER_TEXT.locationLoading
    : WEATHER_HEADER_TEXT.useCurrentLocation;

export const getWeatherResetLocationButtonLabel = (): string =>
  WEATHER_HEADER_TEXT.resetLocation;

/**
 * Weather footer text formatter
 */
export const formatWeatherFooterText = (lastUpdated: string): string =>
  `${WEATHER_FOOTER_TEXT.provider} | ${WEATHER_FOOTER_TEXT.lastUpdatedPrefix} ${new Date(lastUpdated).toLocaleString("ja-JP")}`;
