import {
  appendNotificationSwLog,
  captureNotificationLogs,
  getDeniedNotificationResult,
  getMissingTokenResult,
  getNotificationRuntimeErrorResult,
  getNotificationSuccessResult,
  getUnsupportedNotificationResult,
  requestNotificationPermission,
  runNotificationDelivery,
} from "../state/notificationTestStateActions";

describe("notificationTestStateActions", () => {
  it("service worker log を末尾20件以内で追加する", () => {
    const logs = Array.from({ length: 20 }, (_, index) => `old-${index}`);

    expect(appendNotificationSwLog(logs, "10:00:00", "new log")).toEqual([
      ...logs.slice(1),
      "10:00:00: new log",
    ]);
  });

  it("service worker message から SW_LOG だけを購読する", () => {
    let listener:
      | ((event: { data?: { type?: string; message?: string } }) => void)
      | undefined;
    const onLog = jest.fn();

    captureNotificationLogs(
      {
        addEventListener: (_type, nextListener) => {
          listener = nextListener;
        },
      },
      onLog,
    );

    if (listener) {
      listener({ data: { type: "OTHER", message: "ignore" } });
      listener({ data: { type: "SW_LOG", message: "captured" } });
    }

    expect(onLog).toHaveBeenCalledTimes(1);
    expect(onLog).toHaveBeenCalledWith("captured");
  });

  it("message が空なら log 追加しない", () => {
    let listener:
      | ((event: { data?: { type?: string; message?: string } }) => void)
      | undefined;
    const onLog = jest.fn();

    captureNotificationLogs(
      {
        addEventListener: (_type, nextListener) => {
          listener = nextListener;
        },
      },
      onLog,
    );

    if (listener) {
      listener({ data: { type: "SW_LOG" } });
    }

    expect(onLog).not.toHaveBeenCalled();
  });

  it("service worker がなくても例外にならない", () => {
    expect(() => {
      captureNotificationLogs(undefined, jest.fn());
    }).not.toThrow();
  });

  it("permission が default 以外ならそのまま返す", async () => {
    await expect(
      requestNotificationPermission({
        permission: "granted",
        requestPermission: jest.fn(),
      }),
    ).resolves.toBe("granted");
  });

  it("permission が default なら requestPermission を呼ぶ", async () => {
    const requestPermission = jest.fn(async () => "denied" as const);

    await expect(
      requestNotificationPermission({
        permission: "default",
        requestPermission,
      }),
    ).resolves.toBe("denied");
    expect(requestPermission).toHaveBeenCalled();
  });

  it("各結果factoryが期待値を返す", () => {
    expect(getUnsupportedNotificationResult()).toEqual({
      status: "error",
      debugMessage: "エラー: 通知APIがサポートされていません",
      resetDelay: 3000,
      clearDebugOnReset: false,
    });
    expect(getDeniedNotificationResult("denied")).toEqual({
      status: "error",
      debugMessage: "エラー: 通知権限が拒否されました (denied)",
      resetDelay: 5000,
      clearDebugOnReset: false,
    });
    expect(getMissingTokenResult().status).toBe("error");
    expect(getNotificationSuccessResult().status).toBe("success");
    expect(getNotificationRuntimeErrorResult().clearDebugOnReset).toBe(true);
  });

  it("FCMトークンがなければ error 結果を返す", async () => {
    await expect(
      runNotificationDelivery({
        getFCMToken: jest.fn(async () => null),
        serviceWorkerReady: Promise.resolve({
          showNotification: jest.fn(),
        }),
      }),
    ).resolves.toEqual(getMissingTokenResult());
  });

  it("通知送信成功時は success 結果を返す", async () => {
    const showNotification = jest.fn(async () => undefined);

    await expect(
      runNotificationDelivery({
        getFCMToken: jest.fn(async () => "token-123"),
        serviceWorkerReady: Promise.resolve({ showNotification }),
      }),
    ).resolves.toEqual(getNotificationSuccessResult());
    expect(showNotification).toHaveBeenCalledWith("🎉 通知テスト", {
      body: "バックグラウンド通知が有効になりました！",
      tag: "test-notification",
      icon: "/icon.svg",
      badge: "/icon.svg",
    });
  });

  it("通知送信例外時は runtime error 結果を返す", async () => {
    await expect(
      runNotificationDelivery({
        getFCMToken: jest.fn(async () => {
          throw new Error("failed");
        }),
        serviceWorkerReady: Promise.resolve({
          showNotification: jest.fn(),
        }),
      }),
    ).resolves.toEqual(getNotificationRuntimeErrorResult());
  });
});
