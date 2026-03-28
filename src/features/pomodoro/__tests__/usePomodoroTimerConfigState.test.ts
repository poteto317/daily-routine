import { renderHook } from "@testing-library/react";
import { usePomodoroTimerConfigState } from "../usePomodoroTimerConfigState";

describe("usePomodoroTimerConfigState", () => {
  it("focusMinutes と breakMinutes をそのまま返す", () => {
    const { result, rerender } = renderHook(
      ({ breakMinutes, focusMinutes }) =>
        usePomodoroTimerConfigState({ breakMinutes, focusMinutes }),
      {
        initialProps: {
          breakMinutes: 5,
          focusMinutes: 25,
        },
      },
    );

    expect(result.current).toEqual({
      breakMinutes: 5,
      focusMinutes: 25,
    });

    rerender({
      breakMinutes: 10,
      focusMinutes: 50,
    });

    expect(result.current).toEqual({
      breakMinutes: 10,
      focusMinutes: 50,
    });
  });
});
