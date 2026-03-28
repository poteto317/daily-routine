import { createWeatherLocationActionHandlersResult } from "../page/weatherLocationActionHandlersResult";

describe("createWeatherLocationActionHandlersResult", () => {
  it("location action handlers の公開 shape を返す", () => {
    const clearLocationError = jest.fn();
    const handleResetPreferredLocation = jest.fn(async () => {});
    const handleUseCurrentLocation = jest.fn(async () => {});

    expect(
      createWeatherLocationActionHandlersResult({
        clearLocationError,
        handleResetPreferredLocation,
        handleUseCurrentLocation,
      }),
    ).toEqual({
      clearLocationError,
      handleResetPreferredLocation,
      handleUseCurrentLocation,
    });
  });
});
