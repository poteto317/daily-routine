import { notifyTimerCompletion } from "../pomodoroCompletionNotification";
import { POMODORO_NOTIFICATION_TEXT } from "../texts";

describe("notifyTimerCompletion", () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    window,
    "Notification",
  );

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(window, "Notification", originalDescriptor);
    } else {
      delete (window as unknown as Record<string, unknown>).Notification;
    }
  });

  it("Notification が window に存在しない場合は通知を生成しない", () => {
    delete (window as unknown as Record<string, unknown>).Notification;

    expect(() => notifyTimerCompletion("focus")).not.toThrow();
  });

  it("permission が granted でない場合は通知を生成しない", () => {
    const mockNotificationConstructor = jest.fn();
    Object.defineProperty(window, "Notification", {
      value: Object.assign(mockNotificationConstructor, {
        permission: "denied",
      }),
      writable: true,
      configurable: true,
    });

    notifyTimerCompletion("focus");

    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it("timerState が focus の場合、正しいタイトル・本文・アイコンで通知する", () => {
    const mockNotificationConstructor = jest.fn();
    Object.defineProperty(window, "Notification", {
      value: Object.assign(mockNotificationConstructor, {
        permission: "granted",
      }),
      writable: true,
      configurable: true,
    });

    notifyTimerCompletion("focus");

    expect(mockNotificationConstructor).toHaveBeenCalledTimes(1);
    expect(mockNotificationConstructor).toHaveBeenCalledWith(
      POMODORO_NOTIFICATION_TEXT.focusCompleteTitle,
      {
        body: POMODORO_NOTIFICATION_TEXT.focusCompleteBody,
        icon: "/icon-192.png",
      },
    );
  });

  it("timerState が break の場合、正しいタイトル・本文・アイコンで通知する", () => {
    const mockNotificationConstructor = jest.fn();
    Object.defineProperty(window, "Notification", {
      value: Object.assign(mockNotificationConstructor, {
        permission: "granted",
      }),
      writable: true,
      configurable: true,
    });

    notifyTimerCompletion("break");

    expect(mockNotificationConstructor).toHaveBeenCalledTimes(1);
    expect(mockNotificationConstructor).toHaveBeenCalledWith(
      POMODORO_NOTIFICATION_TEXT.breakCompleteTitle,
      {
        body: POMODORO_NOTIFICATION_TEXT.breakCompleteBody,
        icon: "/icon-192.png",
      },
    );
  });

  it("timerState が idle の場合は通知を生成しない", () => {
    const mockNotificationConstructor = jest.fn();
    Object.defineProperty(window, "Notification", {
      value: Object.assign(mockNotificationConstructor, {
        permission: "granted",
      }),
      writable: true,
      configurable: true,
    });

    notifyTimerCompletion("idle");

    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });
});
