import {
  cacheWeatherData,
  clearPreferredWeatherLocation,
  clearWeatherCache,
  getPreferredWeatherLocation,
  getCachedWeatherData,
  savePreferredWeatherLocation,
} from "../weather-cache";

describe("weather-cache", () => {
  const baseData = {
    location: "東京",
    lastUpdated: "2026-02-12T10:00:00.000Z",
    forecasts: [
      {
        date: "2026-02-12",
        dayOfWeek: "木",
        weather: "sunny" as const,
        temperature: { high: 12, low: 3 },
        precipitation: 10,
        description: "晴れ",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("cacheWeatherDataした内容を有効期限内で取得できる", () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1_000_000);

    cacheWeatherData(baseData, 35.68, 139.76);
    const result = getCachedWeatherData(35.68, 139.76);

    expect(result).toEqual(baseData);

    nowSpy.mockRestore();
  });

  it("キャッシュ期限切れの場合はnullを返しキャッシュを削除する", () => {
    jest.spyOn(Date, "now").mockReturnValue(1_000_000);
    cacheWeatherData(baseData, 35.68, 139.76);

    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");
    const nowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValue(1_000_000 + 30 * 60 * 1000 + 1);

    const result = getCachedWeatherData();

    expect(result).toBeNull();
    expect(removeItemSpy).toHaveBeenCalledWith("weather_cache");

    removeItemSpy.mockRestore();
    nowSpy.mockRestore();
  });

  it("位置差が閾値超過ならキャッシュを返さない", () => {
    jest.spyOn(Date, "now").mockReturnValue(1_000_000);
    cacheWeatherData(baseData, 35.68, 139.76);

    const result = getCachedWeatherData(36.3, 139.76);

    expect(result).toBeNull();
  });

  it("clearWeatherCacheはキャッシュキーを削除する", () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    clearWeatherCache();

    expect(removeItemSpy).toHaveBeenCalledWith("weather_cache");

    removeItemSpy.mockRestore();
  });

  it("savePreferredWeatherLocation/getPreferredWeatherLocationで座標を保存・取得できる", () => {
    savePreferredWeatherLocation(34.6937, 135.5023);

    expect(getPreferredWeatherLocation()).toEqual({
      latitude: 34.6937,
      longitude: 135.5023,
    });
  });

  it("不正な優先地点データはnullを返して破棄する", () => {
    localStorage.setItem("weather_preferred_location", JSON.stringify({
      latitude: "invalid",
      longitude: 139.76,
    }));

    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    expect(getPreferredWeatherLocation()).toBeNull();
    expect(removeItemSpy).toHaveBeenCalledWith("weather_preferred_location");

    removeItemSpy.mockRestore();
  });

  it("clearPreferredWeatherLocationは優先地点キーを削除する", () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    clearPreferredWeatherLocation();

    expect(removeItemSpy).toHaveBeenCalledWith("weather_preferred_location");

    removeItemSpy.mockRestore();
  });
});
