import * as weatherCache from "../cache";

describe("weather cache barrel", () => {
  it("all cache utilities and constants are defined and exported", () => {
    expect(weatherCache.cacheWeatherData).toBeDefined();
    expect(weatherCache.clearPreferredWeatherLocation).toBeDefined();
    expect(weatherCache.clearWeatherCache).toBeDefined();
    expect(weatherCache.getPreferredWeatherLocation).toBeDefined();
    expect(weatherCache.getCachedWeatherData).toBeDefined();
    expect(weatherCache.savePreferredWeatherLocation).toBeDefined();
    expect(weatherCache.LOCATION_DIFF_THRESHOLD).toBeDefined();
    expect(weatherCache.WEATHER_CACHE_DURATION).toBeDefined();
    expect(weatherCache.WEATHER_CACHE_KEY).toBeDefined();
    expect(weatherCache.WEATHER_PREFERRED_LOCATION_KEY).toBeDefined();
  });
});
