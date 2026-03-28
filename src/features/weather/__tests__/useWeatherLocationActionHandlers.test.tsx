import { act, renderHook } from "@testing-library/react";

jest.mock("../page/weatherLocationActionHandlersResult", () => ({
  createWeatherLocationActionHandlersResult: jest.fn(),
}));

jest.mock("../page/useWeatherCurrentLocationAction", () => ({
  useWeatherCurrentLocationAction: jest.fn(),
}));

jest.mock("../page/useWeatherResetPreferredLocationAction", () => ({
  useWeatherResetPreferredLocationAction: jest.fn(),
}));

jest.mock("../page/viewStateActions", () => ({
  createLocationErrorClearedState: jest.fn(),
}));

import { createLocationErrorClearedState } from "../page/viewStateActions";
import { createWeatherLocationActionHandlersResult } from "../page/weatherLocationActionHandlersResult";
import { useWeatherCurrentLocationAction } from "../page/useWeatherCurrentLocationAction";
import { useWeatherLocationActionHandlers } from "../page/useWeatherLocationActionHandlers";
import { useWeatherResetPreferredLocationAction } from "../page/useWeatherResetPreferredLocationAction";

describe("useWeatherLocationActionHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createLocationErrorClearedState as jest.Mock).mockReturnValue({
      locationError: null,
    });
    const handleUseCurrentLocation = jest.fn();
    const handleResetPreferredLocation = jest.fn();
    (useWeatherCurrentLocationAction as jest.Mock).mockReturnValue(
      handleUseCurrentLocation,
    );
    (useWeatherResetPreferredLocationAction as jest.Mock).mockReturnValue(
      handleResetPreferredLocation,
    );
    (createWeatherLocationActionHandlersResult as jest.Mock).mockImplementation(
      (result) => result,
    );
  });

  it("current/reset action hook を compose し、clear を委譲する", async () => {
    const applyViewState = jest.fn();
    const loadWeatherByCoordinates = jest.fn();

    const { result } = renderHook(() =>
      useWeatherLocationActionHandlers({
        applyViewState,
        loadWeatherByCoordinates,
      }),
    );

    expect(useWeatherCurrentLocationAction).toHaveBeenCalledWith({
      applyViewState,
      loadWeatherByCoordinates,
      setLocationStatus: expect.any(Function),
    });
    expect(useWeatherResetPreferredLocationAction).toHaveBeenCalledWith({
      applyViewState,
      loadWeatherByCoordinates,
    });
    expect(createWeatherLocationActionHandlersResult).toHaveBeenCalledWith({
      clearLocationError: expect.any(Function),
      handleResetPreferredLocation: expect.any(Function),
      handleUseCurrentLocation: expect.any(Function),
    });

    const statusUpdater = (useWeatherCurrentLocationAction as jest.Mock).mock
      .calls[0][0].setLocationStatus;
    act(() => {
      statusUpdater("loading");
    });
    expect(applyViewState).toHaveBeenCalledWith({ locationStatus: "loading" });

    act(() => {
      result.current.clearLocationError();
    });

    expect(createLocationErrorClearedState).toHaveBeenCalled();
    expect(applyViewState).toHaveBeenLastCalledWith({ locationError: null });
  });
});
