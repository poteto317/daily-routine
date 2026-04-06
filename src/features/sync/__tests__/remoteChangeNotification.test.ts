import { notifyRemoteChange } from "../sync/remoteChangeNotification";

describe("notifyRemoteChange", () => {
  const originalNotification = global.Notification;

  afterEach(() => {
    // Notification を元に戻す
    Object.defineProperty(global, "Notification", {
      value: originalNotification,
      writable: true,
      configurable: true,
    });
  });

  it("Notification が window に存在しない場合は何もしない", () => {
    // プロパティ自体を削除することで "Notification" in window === false にする
    const descriptor = Object.getOwnPropertyDescriptor(global, "Notification");
    delete (global as Record<string, unknown>).Notification;

    expect(() => notifyRemoteChange()).not.toThrow();

    // テスト後に戻す
    if (descriptor) {
      Object.defineProperty(global, "Notification", descriptor);
    }
  });

  it("permission が denied の場合は Notification を生成しない", () => {
    const mockNotificationConstructor = jest.fn();
    Object.defineProperty(global, "Notification", {
      value: Object.assign(mockNotificationConstructor, {
        permission: "denied",
      }),
      writable: true,
      configurable: true,
    });

    notifyRemoteChange();

    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it("permission が default の場合は Notification を生成しない", () => {
    const mockNotificationConstructor = jest.fn();
    Object.defineProperty(global, "Notification", {
      value: Object.assign(mockNotificationConstructor, {
        permission: "default",
      }),
      writable: true,
      configurable: true,
    });

    notifyRemoteChange();

    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it("permission が granted の場合は正しいタイトルとボディで Notification を生成する", () => {
    const mockNotificationConstructor = jest.fn();
    Object.defineProperty(global, "Notification", {
      value: Object.assign(mockNotificationConstructor, {
        permission: "granted",
      }),
      writable: true,
      configurable: true,
    });

    notifyRemoteChange();

    expect(mockNotificationConstructor).toHaveBeenCalledTimes(1);
    expect(mockNotificationConstructor).toHaveBeenCalledWith(
      "データの変更を検出",
      expect.objectContaining({
        body: "他の端末でデータが更新されました。設定画面から同期してください。",
        tag: "sync-notification",
        icon: "/icon-192x192.png",
      }),
    );
  });
});
