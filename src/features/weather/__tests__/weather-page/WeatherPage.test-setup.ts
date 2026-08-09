import * as weatherApi from "../../weather-api";
import * as weatherCache from "../../weather-cache";

// テスト側は WeatherPage を直接 import せず、必ずこの setup 経由で受け取る。
// jest.mock はそれが書かれたファイルの先頭にしか巻き上げられないため、
// テストファイルが WeatherPage を先に import すると weather-api / weather-cache の
// 実モジュールがモック登録前にバインドされ、モックが効かなくなる。
export { WeatherPage } from "../../WeatherPage";

// weather-api / weather-cache のモックは3つのテストファイルで共通のため、
// ここに集約する。各テストファイルはこの setup を import するだけでよい。
jest.mock("../../weather-api", () => ({ fetchWeatherData: jest.fn() }));
jest.mock("../../weather-cache", () => ({
  getCachedWeatherData: jest.fn(() => null),
  getPreferredWeatherLocation: jest.fn(() => null),
  cacheWeatherData: jest.fn(),
  clearPreferredWeatherLocation: jest.fn(),
  savePreferredWeatherLocation: jest.fn(),
}));

export const mockFetchWeatherData =
  weatherApi.fetchWeatherData as jest.MockedFunction<
    typeof weatherApi.fetchWeatherData
  >;
export const mockGetCachedWeatherData =
  weatherCache.getCachedWeatherData as jest.MockedFunction<
    typeof weatherCache.getCachedWeatherData
  >;
export const mockCacheWeatherData =
  weatherCache.cacheWeatherData as jest.MockedFunction<
    typeof weatherCache.cacheWeatherData
  >;
export const mockGetPreferredWeatherLocation =
  weatherCache.getPreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.getPreferredWeatherLocation
  >;
export const mockSavePreferredWeatherLocation =
  weatherCache.savePreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.savePreferredWeatherLocation
  >;
export const mockClearPreferredWeatherLocation =
  weatherCache.clearPreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.clearPreferredWeatherLocation
  >;

/** 3ファイルで同一内容が重複していた天気データのフィクスチャ */
export const tokyoWeatherData = {
  location: "東京",
  lastUpdated: "2026-02-13T00:00:00.000Z",
  forecasts: [
    {
      date: "2026-02-13",
      dayOfWeek: "金",
      weather: "sunny" as const,
      temperature: { high: 10, low: 2 },
      precipitation: 0,
      description: "快晴です。",
    },
  ],
  hourly: [],
};

/** 各テストの beforeEach で呼ぶ既定状態のセットアップ */
export const setupWeatherPageMocks = () => {
  jest.clearAllMocks();
  mockGetCachedWeatherData.mockReturnValue(null);
  mockGetPreferredWeatherLocation.mockReturnValue(null);
  mockFetchWeatherData.mockResolvedValue(tokyoWeatherData);
};

/**
 * navigator.geolocation を差し替える。
 *
 * グローバルを書き換えるため、テスト間で状態が残らないよう
 * 呼び出し側は afterEach で restoreGeolocation() を呼ぶこと。
 */
const stubGeolocation = (value: unknown) => {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value,
  });
};

/** 差し替えた navigator.geolocation を削除して元の状態に戻す */
export const restoreGeolocation = () => {
  Reflect.deleteProperty(navigator, "geolocation");
};

/**
 * 位置情報の取得を必ず失敗させる。
 * 「位置情報エラー」の表示に依存するテストが共通で使う。
 */
export const stubGeolocationFailure = () => {
  const getCurrentPosition = jest.fn(
    (_success: PositionCallback, error?: PositionErrorCallback | null) => {
      error?.({
        code: 1,
        message: "denied",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);
    },
  );
  stubGeolocation({ getCurrentPosition });
  return getCurrentPosition;
};
