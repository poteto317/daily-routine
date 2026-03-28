import { act, renderHook } from "@testing-library/react";

jest.mock("../page/geolocation", () => ({
  getUserLocation: jest.fn(),
}));

jest.mock("../weather-cache", () => ({
  clearPreferredWeatherLocation: jest.fn(),
  savePreferredWeatherLocation: jest.fn(),
}));

import * as weatherCache from "../weather-cache";
import * as geolocation from "../page/geolocation";
import { GEOLOCATION_MESSAGES, WEATHER_STATUS_MESSAGES } from "../texts";
import { useWeatherLocationState } from "../page/useWeatherLocationState";

const mockSavePreferredWeatherLocation =
  weatherCache.savePreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.savePreferredWeatherLocation
  >;
const mockClearPreferredWeatherLocation =
  weatherCache.clearPreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.clearPreferredWeatherLocation
  >;
const mockGetUserLocation = geolocation.getUserLocation as jest.MockedFunction<
  typeof geolocation.getUserLocation
>;

describe("useWeatherLocationState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("現在地使用で status 更新・保存・天気再取得を行う", async () => {
    const applyViewState = jest.fn();
    const loadWeatherByCoordinates = jest.fn().mockResolvedValue({
      location: "大阪",
      lastUpdated: "2026-02-13T00:00:00.000Z",
      forecasts: [],
      hourly: [],
    });
    mockGetUserLocation.mockImplementation(async (setLocationStatus) => {
      setLocationStatus(GEOLOCATION_MESSAGES.loading);
      return { latitude: 34, longitude: 135 };
    });

    const { result } = renderHook(() =>
      useWeatherLocationState({
        applyViewState,
        loadWeatherByCoordinates,
      }),
    );

    await act(async () => {
      await result.current.handleUseCurrentLocation();
    });

    expect(applyViewState).toHaveBeenNthCalledWith(1, {
      error: null,
      locationError: null,
      isLocationLoading: true,
    });
    expect(applyViewState).toHaveBeenNthCalledWith(2, {
      locationStatus: GEOLOCATION_MESSAGES.loading,
    });
    expect(mockSavePreferredWeatherLocation).toHaveBeenCalledWith(34, 135);
    expect(loadWeatherByCoordinates).toHaveBeenCalledWith(34, 135);
    expect(applyViewState).toHaveBeenLastCalledWith({
      weatherData: expect.objectContaining({ location: "大阪" }),
      hasPreferredLocation: true,
      locationStatus: WEATHER_STATUS_MESSAGES.currentLocation,
      isLocationLoading: false,
    });
  });

  it("現在地取得失敗で locationError を設定する", async () => {
    const applyViewState = jest.fn();
    mockGetUserLocation.mockRejectedValue(new Error("geo failed"));

    const { result } = renderHook(() =>
      useWeatherLocationState({
        applyViewState,
        loadWeatherByCoordinates: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleUseCurrentLocation();
    });

    expect(applyViewState).toHaveBeenLastCalledWith({
      locationStatus: "",
      locationError: WEATHER_STATUS_MESSAGES.locationError,
      isLocationLoading: false,
    });
  });

  it("現在地リセットで東京に戻す", async () => {
    const applyViewState = jest.fn();
    const loadWeatherByCoordinates = jest.fn().mockResolvedValue({
      location: "東京",
      lastUpdated: "2026-02-13T00:00:00.000Z",
      forecasts: [],
      hourly: [],
    });

    const { result } = renderHook(() =>
      useWeatherLocationState({
        applyViewState,
        loadWeatherByCoordinates,
      }),
    );

    await act(async () => {
      await result.current.handleResetPreferredLocation();
    });

    expect(mockClearPreferredWeatherLocation).toHaveBeenCalled();
    expect(loadWeatherByCoordinates).toHaveBeenCalledWith(35.6762, 139.6503);
    expect(applyViewState).toHaveBeenLastCalledWith({
      weatherData: expect.objectContaining({ location: "東京" }),
      hasPreferredLocation: false,
      locationStatus: WEATHER_STATUS_MESSAGES.locationReset,
      isLocationLoading: false,
    });
  });

  it("現在地リセット失敗で error を設定する", async () => {
    const applyViewState = jest.fn();
    const loadWeatherByCoordinates = jest
      .fn()
      .mockRejectedValue(new Error("reset failed"));

    const { result } = renderHook(() =>
      useWeatherLocationState({
        applyViewState,
        loadWeatherByCoordinates,
      }),
    );

    await act(async () => {
      await result.current.handleResetPreferredLocation();
    });

    expect(applyViewState).toHaveBeenLastCalledWith({
      error: "reset failed",
      locationStatus: "",
      isLocationLoading: false,
    });
  });

  it("clearLocationError で locationError を消す", () => {
    const applyViewState = jest.fn();

    const { result } = renderHook(() =>
      useWeatherLocationState({
        applyViewState,
        loadWeatherByCoordinates: jest.fn(),
      }),
    );

    act(() => {
      result.current.clearLocationError();
    });

    expect(applyViewState).toHaveBeenCalledWith({
      locationError: null,
    });
  });
});
