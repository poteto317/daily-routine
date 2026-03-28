import { act, renderHook } from "@testing-library/react";
import { useRoutineDayToggleAction } from "../components/useRoutineDayToggleAction";

describe("useRoutineDayToggleAction", () => {
  it("曜日を toggle する updater を setDaysOfWeek に渡す", () => {
    const setDaysOfWeek = jest.fn();
    const { result } = renderHook(() =>
      useRoutineDayToggleAction({
        setDaysOfWeek,
      }),
    );

    act(() => {
      result.current(2);
    });

    expect(setDaysOfWeek).toHaveBeenCalledWith(expect.any(Function));
    const updater = (setDaysOfWeek as jest.Mock).mock.calls[0][0] as (
      prev: number[],
    ) => number[];
    expect(updater([1, 3])).toEqual([1, 2, 3]);
    expect(updater([1, 2, 3])).toEqual([1, 3]);
  });
});
