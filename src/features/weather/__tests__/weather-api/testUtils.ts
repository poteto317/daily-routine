import { type OpenMeteoResponse } from "../../weather-api";

global.fetch = jest.fn();

export const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

export const mockWeatherAndLocation = (
  weather: OpenMeteoResponse,
  locationName: string = "東京都",
) => {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => weather,
    } as Response)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ address: { city: locationName } }),
    } as Response);
};

export const createDailyResponse = (
  weatherCode: number,
  precipitation: number | null = 10,
): OpenMeteoResponse => ({
  latitude: 35.6762,
  longitude: 139.6503,
  timezone: "Asia/Tokyo",
  daily: {
    time: ["2026-02-09"],
    temperature_2m_max: [15.5],
    temperature_2m_min: [8.3],
    precipitation_probability_max: [precipitation],
    weather_code: [weatherCode],
  },
});
