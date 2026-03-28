/**
 * 天気予報の事前ロード用hook
 * アプリケーション起動時に天気データを先読みしてキャッシュする
 */

import { useEffect } from "react";
import { fetchWeatherData } from "./weather-api";
import { cacheWeatherData, getPreferredWeatherLocation } from "./weather-cache";
import { WEATHER_CONSOLE_MESSAGES } from "./texts";

const TOKYO_LATITUDE = 35.6762;
const TOKYO_LONGITUDE = 139.6503;

/**
 * 天気データを事前にロードするhook
 * バックグラウンドで天気データを取得してキャッシュする
 */
export const usePreloadWeather = () => {
  useEffect(() => {
    const preloadWeather = async () => {
      try {
        const preferredLocation = getPreferredWeatherLocation();
        const latitude = preferredLocation?.latitude ?? TOKYO_LATITUDE;
        const longitude = preferredLocation?.longitude ?? TOKYO_LONGITUDE;

        // 天気データを取得してキャッシュ（時間ごとのデータも含む）
        const data = await fetchWeatherData(latitude, longitude, true);
        cacheWeatherData(data, latitude, longitude);
        console.log(WEATHER_CONSOLE_MESSAGES.preloadSuccess);
      } catch (error) {
        // エラーは無視（バックグラウンド処理のため）
        console.warn(WEATHER_CONSOLE_MESSAGES.preloadFailed, error);
      }
    };

    // 少し遅延させて実行（メインの処理を優先）
    const timer = setTimeout(preloadWeather, 1000);

    return () => clearTimeout(timer);
  }, []);
};
