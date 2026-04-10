import {
  createCurrentLocationErrorState,
  createInitialWeatherErrorState,
  createInitialWeatherPageState,
  createInitialWeatherSuccessState,
  createLocationErrorClearedState,
  createLocationWeatherStartState,
  createLocationWeatherSuccessState,
  createPreferredLocationResetErrorState,
} from "../page/viewStateActions";

describe("weather viewStateActions", () => {
  const weatherData = {
    location: "東京",
    lastUpdated: "2026-02-13T00:00:00.000Z",
    forecasts: [],
    hourly: [],
  };

  it("初期 view state を作る", () => {
    expect(createInitialWeatherPageState()).toEqual({
      weatherData: null,
      isLoading: true,
      isLocationLoading: false,
      hasPreferredLocation: false,
      error: null,
      locationError: null,
      locationStatus: "",
    });
  });

  it("現在地取得開始 state を作る", () => {
    expect(createLocationWeatherStartState()).toEqual({
      error: null,
      locationError: null,
      isLocationLoading: true,
    });
  });

  it("初期ロード成功 state を作る", () => {
    expect(
      createInitialWeatherSuccessState({
        weatherData,
        hasPreferredLocation: true,
        locationStatus: "現在地の天気を表示中",
      }),
    ).toEqual({
      weatherData,
      hasPreferredLocation: true,
      locationStatus: "現在地の天気を表示中",
      error: null,
      isLoading: false,
    });

    expect(
      createInitialWeatherSuccessState({
        weatherData,
        hasPreferredLocation: false,
        locationStatus: "東京の天気を表示中",
        fromCache: true,
      }),
    ).toEqual({
      weatherData,
      hasPreferredLocation: false,
      locationStatus: "",
      error: null,
      isLoading: false,
    });
  });

  it("位置取得成功と失敗 state を作る", () => {
    expect(
      createLocationWeatherSuccessState({
        weatherData,
        hasPreferredLocation: true,
        locationStatus: "現在地の天気を表示中",
      }),
    ).toEqual({
      weatherData,
      hasPreferredLocation: true,
      locationStatus: "現在地の天気を表示中",
      isLocationLoading: false,
    });

    expect(
      createCurrentLocationErrorState("位置情報の取得に失敗しました"),
    ).toEqual({
      locationStatus: "",
      locationError: "位置情報の取得に失敗しました",
      isLocationLoading: false,
    });
    expect(createPreferredLocationResetErrorState("fail")).toEqual({
      error: "fail",
      locationStatus: "",
      isLocationLoading: false,
    });
  });

  it("エラー解消 state を作る", () => {
    expect(createInitialWeatherErrorState("fetch failed")).toEqual({
      error: "fetch failed",
      locationStatus: "",
      isLoading: false,
    });
    expect(createLocationErrorClearedState()).toEqual({
      locationError: null,
    });
  });
});
