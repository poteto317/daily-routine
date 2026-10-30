import "./helpers.test.setup";
import {
  getRoutinesNeedingNotification,
  sendBrowserNotification,
  syncRoutinesToFirebase,
} from "../helpers";
import {
  baseRoutine,
  mockGetFCMToken,
  setupHelpersDefaults,
} from "./helpers.test.setup";

describe("helpers sync and notification", () => {
  const originalFetch = global.fetch;
  const originalNotification = Object.getOwnPropertyDescriptor(
    window,
    "Notification",
  );

  beforeEach(setupHelpersDefaults);

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalNotification) {
      Object.defineProperty(window, "Notification", originalNotification);
    } else {
      delete (window as { Notification?: unknown }).Notification;
    }
  });

  it("syncRoutinesToFirebaseの失敗/成功を判定する", async () => {
    mockGetFCMToken.mockResolvedValueOnce(null as never);
    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://example.com"),
    ).resolves.toBe(false);

    mockGetFCMToken.mockResolvedValueOnce("token");
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as never);
    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://example.com"),
    ).resolves.toBe(true);
  });

  it("通知対象の抽出と重複通知防止が動作する", () => {
    const now = new Date(2026, 1, 12, 9, 30, 0);
    const routines = [
      {
        ...baseRoutine,
        id: "a",
        startTime: "09:00",
        notificationMinutes: 10,
        isCompleted: false,
      },
      {
        ...baseRoutine,
        id: "b",
        startTime: "09:25",
        notificationMinutes: 10,
        isCompleted: false,
      },
      {
        ...baseRoutine,
        id: "c",
        startTime: "09:00",
        notificationMinutes: 10,
        isCompleted: true,
      },
    ];
    expect(
      getRoutinesNeedingNotification(routines, now).map(
        (routine) => routine.id,
      ),
    ).toEqual(["a"]);

    const notificationMock = jest.fn();
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: Object.assign(notificationMock, { permission: "granted" }),
    });
    expect(sendBrowserNotification(baseRoutine, "2026-02-12")).toBe(true);
    expect(sendBrowserNotification(baseRoutine, "2026-02-12")).toBe(false);
  });
});
