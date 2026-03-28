import { renderHook } from "@testing-library/react";
import { useHomePageEffects } from "../useHomePageEffects";
import { usePreloadWeather } from "@/features/weather/usePreloadWeather";
import { useFirebaseSync } from "../useFirebaseSync";
import { useHomePopState } from "../useHomePopState";

jest.mock("@/features/weather/usePreloadWeather", () => ({
  usePreloadWeather: jest.fn(),
}));

jest.mock("../useFirebaseSync", () => ({
  useFirebaseSync: jest.fn(),
}));

jest.mock("../useHomePopState", () => ({
  useHomePopState: jest.fn(),
}));

describe("useHomePageEffects", () => {
  it("Home関連の副作用フックをまとめて実行する", () => {
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();

    renderHook(() =>
      useHomePageEffects({
        showForm: true,
        closeFormAction,
        setCurrentPageAction,
      }),
    );

    expect(useFirebaseSync).toHaveBeenCalledTimes(1);
    expect(usePreloadWeather).toHaveBeenCalledTimes(1);
    expect(useHomePopState).toHaveBeenCalledWith({
      showForm: true,
      closeFormAction,
      setCurrentPageAction,
    });
  });
});
