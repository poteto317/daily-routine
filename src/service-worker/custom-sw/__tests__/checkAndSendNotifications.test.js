import { checkAndSendNotifications } from "../checkAndSendNotifications";

jest.mock("../notificationFlagsCache", () => ({
  getCacheValue: jest.fn(),
  setCacheValue: jest.fn(),
}));

jest.mock("../logToClient", () => ({
  logToClient: jest.fn(),
}));

import { getCacheValue, setCacheValue } from "../notificationFlagsCache";

describe("checkAndSendNotifications", () => {
  let showNotification;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-07-11T09:00:00+09:00"));
    showNotification = jest.fn().mockResolvedValue(undefined);
    global.self.registration = { showNotification };
    getCacheValue.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const schedule = {
    title: "朝の運動",
    body: "始めましょう",
    time: "09:00",
    minutesAfter: 0,
  };

  it("SVGはAndroidで表示されないためicon-192.pngを通知アイコンに使う", async () => {
    await checkAndSendNotifications(new Map([["routine-1-0", schedule]]));

    expect(showNotification).toHaveBeenCalledWith(
      "朝の運動",
      expect.objectContaining({
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      }),
    );
  });

  it("通知後に通知済みフラグを保存する", async () => {
    await checkAndSendNotifications(new Map([["routine-1-0", schedule]]));

    expect(setCacheValue).toHaveBeenCalledWith(
      "notified_routine-1_2026-07-11",
      "true",
    );
  });

  it("既に通知済みの場合は通知しない", async () => {
    getCacheValue.mockResolvedValue("true");

    await checkAndSendNotifications(new Map([["routine-1-0", schedule]]));

    expect(showNotification).not.toHaveBeenCalled();
  });

  it("予定時刻から90秒以上離れている場合は通知しない", async () => {
    await checkAndSendNotifications(
      new Map([["routine-1-0", { ...schedule, time: "09:10" }]]),
    );

    expect(showNotification).not.toHaveBeenCalled();
  });

  it("曜日が一致しないスケジュールは通知しない", async () => {
    const mismatchedDayOfWeek = (new Date("2026-07-11T09:00:00+09:00").getDay() + 1) % 7;

    await checkAndSendNotifications(
      new Map([["routine-1-0", { ...schedule, dayOfWeek: mismatchedDayOfWeek }]]),
    );

    expect(showNotification).not.toHaveBeenCalled();
  });
});
