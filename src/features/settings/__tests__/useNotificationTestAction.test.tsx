import { act, renderHook } from "@testing-library/react";

jest.mock("@/lib/firebase", () => ({
  getFCMToken: jest.fn(),
}));

import { getFCMToken } from "@/lib/firebase";
import { useNotificationTestAction } from "../state/useNotificationTestAction";

describe("useNotificationTestAction", () => {
  const originalNotification = window.Notification;
  const originalServiceWorker = navigator.serviceWorker;

  const setServiceWorker = (serviceWorker: unknown) => {
    Reflect.set(navigator, "serviceWorker", serviceWorker);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();

    if (originalNotification) {
      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: originalNotification,
      });
    } else {
      // @ts-expect-error test cleanup
      delete window.Notification;
    }

    setServiceWorker(originalServiceWorker);
  });

  it("Notification API 非対応なら error 後に idle に戻る", async () => {
    const startLogCapture = jest.fn();
    // @ts-expect-error test setup
    delete window.Notification;
    setServiceWorker({
      addEventListener: jest.fn(),
      ready: Promise.resolve({ showNotification: jest.fn() }),
    });

    const { result } = renderHook(() =>
      useNotificationTestAction({ startLogCapture }),
    );

    await act(async () => {
      await result.current.handleTestNotification();
    });

    expect(startLogCapture).toHaveBeenCalled();
    expect(result.current.notificationStatus).toBe("error");
    expect(result.current.debugMessage).toContain(
      "通知APIがサポートされていません",
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.notificationStatus).toBe("idle");
  });

  it("通知成功なら success 後に idle へ戻り debugMessage を消す", async () => {
    const showNotification = jest.fn(async () => undefined);

    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: {
        permission: "granted",
        requestPermission: jest.fn(),
      },
    });
    setServiceWorker({
      addEventListener: jest.fn(),
      ready: Promise.resolve({ showNotification }),
    });
    (getFCMToken as jest.Mock).mockResolvedValue("token-123");

    const { result } = renderHook(() =>
      useNotificationTestAction({ startLogCapture: jest.fn() }),
    );

    await act(async () => {
      await result.current.handleTestNotification();
    });

    expect(showNotification).toHaveBeenCalled();
    expect(result.current.notificationStatus).toBe("success");
    expect(result.current.debugMessage).toContain("通知送信完了");

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.notificationStatus).toBe("idle");
    expect(result.current.debugMessage).toBe("");
  });
});
