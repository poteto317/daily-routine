import { act, renderHook } from "@testing-library/react";
import { useRoutineNotificationFieldState } from "../components/useRoutineNotificationFieldState";

describe("useRoutineNotificationFieldState", () => {
  it("notificationMinutes を管理する", () => {
    const { result } = renderHook(() =>
      useRoutineNotificationFieldState({
        initialNotificationMinutes: "10",
      }),
    );

    act(() => {
      result.current.setNotificationMinutes("0");
    });

    expect(result.current.notificationMinutes).toBe("0");
  });
});
