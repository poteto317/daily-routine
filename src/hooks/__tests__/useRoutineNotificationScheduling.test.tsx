import { act, renderHook } from "@testing-library/react";

jest.mock("../routineNotificationScheduling", () => ({
  scheduleRoutineNotificationsIfPermitted: jest.fn(),
}));

import { scheduleRoutineNotificationsIfPermitted } from "../routineNotificationScheduling";
import { useRoutineNotificationScheduling } from "../useRoutineNotificationScheduling";

describe("useRoutineNotificationScheduling", () => {
  it("通知 scheduling action を委譲する", async () => {
    const { result } = renderHook(() => useRoutineNotificationScheduling());

    await act(async () => {
      await result.current();
    });

    expect(scheduleRoutineNotificationsIfPermitted).toHaveBeenCalled();
  });
});
