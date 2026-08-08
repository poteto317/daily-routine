import {
  hasNotificationPermission,
  requestNotificationPermission,
} from "../notification-permission";

describe("requestNotificationPermission", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    Object.defineProperty(global.Notification, "permission", {
      value: "default",
      writable: true,
      configurable: true,
    });
  });

  it("Notification APIが存在しない場合はdeniedを返す", async () => {
    const originalNotification = global.Notification;
    try {
      // @ts-expect-error テストのため意図的にグローバルNotificationを削除する
      delete global.Notification;

      await expect(requestNotificationPermission()).resolves.toBe("denied");
    } finally {
      global.Notification = originalNotification;
    }
  });

  it("permissionがdefaultの場合はrequestPermissionを呼びその結果を返す", async () => {
    Object.defineProperty(global.Notification, "permission", {
      value: "default",
      configurable: true,
    });
    const requestPermissionSpy = jest
      .spyOn(global.Notification, "requestPermission")
      .mockResolvedValue("granted");

    await expect(requestNotificationPermission()).resolves.toBe("granted");
    expect(requestPermissionSpy).toHaveBeenCalledTimes(1);
  });

  it("permissionがdefault以外の場合はrequestPermissionを呼ばずそのまま返す", async () => {
    Object.defineProperty(global.Notification, "permission", {
      value: "denied",
      configurable: true,
    });
    const requestPermissionSpy = jest.spyOn(
      global.Notification,
      "requestPermission",
    );

    await expect(requestNotificationPermission()).resolves.toBe("denied");
    expect(requestPermissionSpy).not.toHaveBeenCalled();
  });
});

describe("hasNotificationPermission", () => {
  afterEach(() => {
    Object.defineProperty(global.Notification, "permission", {
      value: "default",
      writable: true,
      configurable: true,
    });
  });

  it("Notification APIが存在しない場合はfalseを返す", () => {
    const originalNotification = global.Notification;
    try {
      // @ts-expect-error テストのため意図的にグローバルNotificationを削除する
      delete global.Notification;

      expect(hasNotificationPermission()).toBe(false);
    } finally {
      global.Notification = originalNotification;
    }
  });

  it("permissionがgrantedの場合はtrueを返す", () => {
    Object.defineProperty(global.Notification, "permission", {
      value: "granted",
      configurable: true,
    });

    expect(hasNotificationPermission()).toBe(true);
  });

  it("permissionがgranted以外の場合はfalseを返す", () => {
    Object.defineProperty(global.Notification, "permission", {
      value: "denied",
      configurable: true,
    });

    expect(hasNotificationPermission()).toBe(false);
  });
});
