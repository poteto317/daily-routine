import {
  clearNotificationSchedules,
  scheduleNotifications,
} from "../notification-messaging";
import type { NotificationSchedule } from "../notification-types";
import {
  originalServiceWorker,
  setServiceWorker,
} from "./notification-messaging.test.setup";

describe("notification-messaging", () => {
  // 実装内のsetTimeoutが未解決のまま残りjestがopen handleを検知するのを防ぐため、
  // 常にfake timersを使う（Promiseのmicrotask解決自体には影響しない）
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    setServiceWorker(originalServiceWorker);
  });

  describe("scheduleNotifications", () => {
    const schedules: NotificationSchedule[] = [
      {
        id: "r1-1",
        title: "朝食",
        body: "07:00の朝食",
        time: "07:00",
        minutesAfter: 0,
        dayOfWeek: 1,
      },
    ];

    it("activeなService Workerがなければfalseを返す", async () => {
      setServiceWorker({ ready: Promise.resolve({ active: null }) });

      await expect(scheduleNotifications(schedules)).resolves.toBe(false);
    });

    it("成功応答を受け取るとtrueを返し、正しいpayloadを送る", async () => {
      const postMessage = jest.fn((message, transfer) => {
        const [port2] = transfer as [MessagePort];
        port2.postMessage({ success: true });
      });
      setServiceWorker({
        ready: Promise.resolve({ active: { postMessage } }),
      });

      await expect(scheduleNotifications(schedules)).resolves.toBe(true);
      expect(postMessage).toHaveBeenCalledWith(
        { type: "SCHEDULE_NOTIFICATIONS", schedules },
        expect.any(Array),
      );
    });

    it("失敗応答を受け取るとfalseを返す", async () => {
      const postMessage = jest.fn((message, transfer) => {
        const [port2] = transfer as [MessagePort];
        port2.postMessage({ success: false });
      });
      setServiceWorker({
        ready: Promise.resolve({ active: { postMessage } }),
      });

      await expect(scheduleNotifications(schedules)).resolves.toBe(false);
    });

    it("応答がないままタイムアウトするとfalseを返す", async () => {
      jest.useFakeTimers();
      setServiceWorker({
        ready: Promise.resolve({ active: { postMessage: jest.fn() } }),
      });

      const resultPromise = scheduleNotifications(schedules);
      await jest.advanceTimersByTimeAsync(10000);

      await expect(resultPromise).resolves.toBe(false);
    });

    it("Service Worker取得中に例外が起きるとfalseを返す", async () => {
      setServiceWorker({
        get ready() {
          throw new Error("unavailable");
        },
      });

      await expect(scheduleNotifications(schedules)).resolves.toBe(false);
    });
  });

  describe("clearNotificationSchedules", () => {
    it("activeなService Workerがなければfalseを返す", async () => {
      setServiceWorker({ ready: Promise.resolve({ active: null }) });

      await expect(clearNotificationSchedules()).resolves.toBe(false);
    });

    it("成功応答を受け取るとtrueを返し、CLEAR_SCHEDULESを送る", async () => {
      const postMessage = jest.fn((message, transfer) => {
        const [port2] = transfer as [MessagePort];
        port2.postMessage({ success: true });
      });
      setServiceWorker({
        ready: Promise.resolve({ active: { postMessage } }),
      });

      await expect(clearNotificationSchedules()).resolves.toBe(true);
      expect(postMessage).toHaveBeenCalledWith(
        { type: "CLEAR_SCHEDULES" },
        expect.any(Array),
      );
    });

    it("失敗応答を受け取るとfalseを返す", async () => {
      const postMessage = jest.fn((message, transfer) => {
        const [port2] = transfer as [MessagePort];
        port2.postMessage({ success: false });
      });
      setServiceWorker({
        ready: Promise.resolve({ active: { postMessage } }),
      });

      await expect(clearNotificationSchedules()).resolves.toBe(false);
    });

    it("Service Worker取得中に例外が起きるとfalseを返す", async () => {
      setServiceWorker({
        get ready() {
          throw new Error("unavailable");
        },
      });

      await expect(clearNotificationSchedules()).resolves.toBe(false);
    });

    it("応答がないままタイムアウトするとfalseを返す", async () => {
      jest.useFakeTimers();
      setServiceWorker({
        ready: Promise.resolve({ active: { postMessage: jest.fn() } }),
      });

      const resultPromise = clearNotificationSchedules();
      await jest.advanceTimersByTimeAsync(5000);

      await expect(resultPromise).resolves.toBe(false);
    });
  });
});
