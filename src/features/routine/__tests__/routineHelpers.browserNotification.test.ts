import "./routineHelpers.test.setup";
import { sendBrowserNotification } from "../helpers";
import {
  baseRoutine,
  setupRoutineHelpersDefaults,
} from "./routineHelpers.test.setup";

describe("routine helpers browser notification", () => {
  beforeEach(() => {
    setupRoutineHelpersDefaults();
    (global.Notification as unknown as Record<string, unknown>) = {
      permission: "granted",
      requestPermission: jest.fn(),
    };
  });

  it("権限がある場合送信し、同日重複を防ぐ", () => {
    const NotificationMock = jest.fn() as jest.Mock & { permission: string };
    (
      global as unknown as { Notification: typeof NotificationMock }
    ).Notification = NotificationMock;
    NotificationMock.permission = "granted";

    expect(sendBrowserNotification(baseRoutine, "2024-01-01")).toBe(true);
    expect(sendBrowserNotification(baseRoutine, "2024-01-01")).toBe(false);
    expect(sendBrowserNotification(baseRoutine, "2024-01-02")).toBe(true);
    expect(NotificationMock).toHaveBeenCalledTimes(2);
  });

  it("権限がない場合送信しない", () => {
    const NotificationMock = jest.fn() as jest.Mock & { permission: string };
    (
      global as unknown as { Notification: typeof NotificationMock }
    ).Notification = NotificationMock;
    NotificationMock.permission = "denied";
    expect(sendBrowserNotification(baseRoutine, "2024-01-01")).toBe(false);
  });
});
