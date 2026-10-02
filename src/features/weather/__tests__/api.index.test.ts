import * as weatherApi from "../api";

describe("weather api barrel", () => {
  it("all api utilities are defined and exported", () => {
    expect(weatherApi.fetchWeatherData).toBeDefined();
    expect(weatherApi.getWeatherDescription).toBeDefined();
    expect(weatherApi.mapWeatherCodeToType).toBeDefined();
    expect(weatherApi.getLocationName).toBeDefined();
    expect(weatherApi.getWeatherDescription("sunny")).toBe(
      "快晴です。お出かけ日和ですね！",
    );
    expect(weatherApi.mapWeatherCodeToType(0)).toBe("sunny");
  });
});
