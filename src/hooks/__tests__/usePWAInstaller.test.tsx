import { renderHook } from "@testing-library/react";

jest.mock("../useRoutineNotificationScheduling", () => ({
  useRoutineNotificationScheduling: jest.fn(() => jest.fn()),
}));

jest.mock("../useMessagingServiceWorkerRegistration", () => ({
  useMessagingServiceWorkerRegistration: jest.fn(),
}));

import { useMessagingServiceWorkerRegistration } from "../useMessagingServiceWorkerRegistration";
import { usePWAInstaller } from "../usePWAInstaller";
import { useRoutineNotificationScheduling } from "../useRoutineNotificationScheduling";

describe("usePWAInstaller", () => {
  it("registration hook と notification scheduling hook を compose する", () => {
    renderHook(() => usePWAInstaller());

    expect(useRoutineNotificationScheduling).toHaveBeenCalled();
    expect(useMessagingServiceWorkerRegistration).toHaveBeenCalledWith(
      (useRoutineNotificationScheduling as jest.Mock).mock.results[0].value,
    );
  });
});
