jest.mock("../weather-api", () => ({ fetchWeatherData: jest.fn() }));
jest.mock("../weather-cache", () => ({ cacheWeatherData: jest.fn() }));
jest.mock("../page/pageStateActions", () => ({
  loadWeatherByCoordinates: jest.fn(),
}));

import { fetchWeatherData } from "../weather-api";
import { cacheWeatherData } from "../weather-cache";
import { loadWeatherByCoordinates } from "../page/pageStateActions";
import { createWeatherPageLoadAction } from "../page/weatherPageLoadAction";

describe("weatherPageLoadAction", () => {
  it("loadWeatherByCoordinates に weather 依存を束ねる", async () => {
    const weatherData = {
      location: "東京",
      lastUpdated: "2026-02-13T00:00:00.000Z",
      forecasts: [],
      hourly: [],
    };
    (loadWeatherByCoordinates as jest.Mock).mockResolvedValue(weatherData);

    const loadWeather = createWeatherPageLoadAction();

    await expect(loadWeather(35.6762, 139.6503)).resolves.toEqual(weatherData);
    expect(loadWeatherByCoordinates).toHaveBeenCalledWith({
      latitude: 35.6762,
      longitude: 139.6503,
      fetchWeatherData,
      cacheWeatherData,
    });
  });
});
