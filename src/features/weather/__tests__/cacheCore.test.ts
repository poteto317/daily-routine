import {
  cacheWeatherData,
  clearPreferredWeatherLocation,
  clearWeatherCache,
  getCachedWeatherData,
  getPreferredWeatherLocation,
  savePreferredWeatherLocation,
} from "../cache/core";
import {
  WEATHER_CACHE_DURATION,
  WEATHER_CACHE_KEY,
  WEATHER_PREFERRED_LOCATION_KEY,
} from "../cache/constants";
import type { WeatherData } from "../api";

const NOW = new Date("2026-03-07T03:00:00+09:00");

const data = {
  location: "東京",
  lastUpdated: "2026-03-07T02:50:00+09:00",
  forecasts: [],
  hourly: [],
} as unknown as WeatherData;

const putCache = (overrides: Record<string, unknown>) => {
  localStorage.setItem(
    WEATHER_CACHE_KEY,
    JSON.stringify({
      ...data,
      latitude: 35.68,
      longitude: 139.76,
      timestamp: NOW.getTime(),
      ...overrides,
    }),
  );
};

describe("weather cache core", () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(NOW);
    warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe("cacheWeatherData / getCachedWeatherData", () => {
    it("保存した天気を位置の指定なしで読み戻せる", () => {
      cacheWeatherData(data, 35.68, 139.76);

      expect(getCachedWeatherData()).toEqual(data);
      expect(
        JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY)!),
      ).toMatchObject({
        latitude: 35.68,
        longitude: 139.76,
        timestamp: NOW.getTime(),
      });
    });

    it("キャッシュが無ければ null", () => {
      expect(getCachedWeatherData()).toBeNull();
    });

    it("期限ちょうどは有効、1ms 超えると削除して null", () => {
      cacheWeatherData(data, 35.68, 139.76);

      jest.setSystemTime(NOW.getTime() + WEATHER_CACHE_DURATION);
      expect(getCachedWeatherData()).toEqual(data);

      jest.setSystemTime(NOW.getTime() + WEATHER_CACHE_DURATION + 1);
      expect(getCachedWeatherData()).toBeNull();
      expect(localStorage.getItem(WEATHER_CACHE_KEY)).toBeNull();
    });

    it("位置が閾値以内なら返し、緯度・経度どちらかが超えると null（削除はしない）", () => {
      putCache({});

      expect(getCachedWeatherData(35.68 + 0.5, 139.76 - 0.5)).toEqual(data);
      expect(getCachedWeatherData(35.68 + 0.51, 139.76)).toBeNull();
      expect(getCachedWeatherData(35.68, 139.76 - 0.51)).toBeNull();
      expect(localStorage.getItem(WEATHER_CACHE_KEY)).not.toBeNull();
    });

    it("緯度だけ・経度だけの指定では位置を比較しない", () => {
      putCache({});

      expect(getCachedWeatherData(0, undefined)).toEqual(data);
      expect(getCachedWeatherData(undefined, 0)).toEqual(data);
    });

    it("壊れた JSON は警告して null", () => {
      localStorage.setItem(WEATHER_CACHE_KEY, "{broken");

      expect(getCachedWeatherData()).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("JSON が null のときは警告して null", () => {
      localStorage.setItem(WEATHER_CACHE_KEY, "null");

      expect(getCachedWeatherData()).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("timestamp が無い形違いの値は期限切れ扱いにならず中身をそのまま返す", () => {
      // 現状: timestamp が undefined だと NaN > 期限 が false になり、
      // 期限判定をすり抜けて欠けたフィールドが undefined のまま返る（要確認）
      localStorage.setItem(
        WEATHER_CACHE_KEY,
        JSON.stringify({ location: "東京" }),
      );

      expect(getCachedWeatherData()).toEqual({
        location: "東京",
        lastUpdated: undefined,
        forecasts: undefined,
        hourly: undefined,
      });
    });

    it("読み取りの例外は警告して null", () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("denied");
      });

      expect(getCachedWeatherData()).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("保存の例外は警告するだけで投げない", () => {
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota");
      });

      expect(() => cacheWeatherData(data, 1, 2)).not.toThrow();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearWeatherCache", () => {
    it("キャッシュを削除する", () => {
      cacheWeatherData(data, 1, 2);

      clearWeatherCache();

      expect(localStorage.getItem(WEATHER_CACHE_KEY)).toBeNull();
    });

    it("削除の例外は警告するだけで投げない", () => {
      jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("denied");
      });

      expect(() => clearWeatherCache()).not.toThrow();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe("preferred location", () => {
    it("保存した位置を読み戻せる", () => {
      savePreferredWeatherLocation(35.1, 139.2);

      expect(getPreferredWeatherLocation()).toEqual({
        latitude: 35.1,
        longitude: 139.2,
      });
    });

    it("未保存なら null", () => {
      expect(getPreferredWeatherLocation()).toBeNull();
    });

    it("数値でない・欠けた形は削除して null", () => {
      localStorage.setItem(
        WEATHER_PREFERRED_LOCATION_KEY,
        JSON.stringify({ latitude: "35", longitude: 139 }),
      );
      expect(getPreferredWeatherLocation()).toBeNull();
      expect(localStorage.getItem(WEATHER_PREFERRED_LOCATION_KEY)).toBeNull();

      localStorage.setItem(
        WEATHER_PREFERRED_LOCATION_KEY,
        JSON.stringify({ latitude: 35 }),
      );
      expect(getPreferredWeatherLocation()).toBeNull();
      expect(localStorage.getItem(WEATHER_PREFERRED_LOCATION_KEY)).toBeNull();
    });

    it("余計なフィールドは落として返す", () => {
      localStorage.setItem(
        WEATHER_PREFERRED_LOCATION_KEY,
        JSON.stringify({ latitude: 1, longitude: 2, extra: "x" }),
      );

      expect(getPreferredWeatherLocation()).toEqual({
        latitude: 1,
        longitude: 2,
      });
    });

    it("壊れた JSON は警告して null", () => {
      localStorage.setItem(WEATHER_PREFERRED_LOCATION_KEY, "{broken");

      expect(getPreferredWeatherLocation()).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("JSON が null のときは警告して null", () => {
      localStorage.setItem(WEATHER_PREFERRED_LOCATION_KEY, "null");

      expect(getPreferredWeatherLocation()).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("保存の例外は警告するだけで投げない", () => {
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota");
      });

      expect(() => savePreferredWeatherLocation(1, 2)).not.toThrow();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("削除でき、削除の例外は警告するだけで投げない", () => {
      savePreferredWeatherLocation(1, 2);
      clearPreferredWeatherLocation();
      expect(localStorage.getItem(WEATHER_PREFERRED_LOCATION_KEY)).toBeNull();

      jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("denied");
      });
      expect(() => clearPreferredWeatherLocation()).not.toThrow();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});
