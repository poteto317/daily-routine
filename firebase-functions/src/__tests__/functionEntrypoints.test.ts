/** @jest-environment node */
// onSchedule / onRequest は、渡された設定と処理本体をそのまま返すモックにする
jest.mock("firebase-functions/v2/scheduler", () => ({
  onSchedule: jest.fn((options: unknown, handler: unknown) => ({
    options,
    handler,
  })),
}));
jest.mock("firebase-functions/https", () => ({
  onRequest: jest.fn((options: unknown, handler: unknown) => ({
    options,
    handler,
  })),
}));
jest.mock("firebase-functions/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
jest.mock("../date-utils", () => ({
  getCurrentNotificationContext: jest.fn(),
}));
jest.mock("../notification-helpers", () => ({
  processAllUsersNotifications: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../cleanup-helpers", () => ({
  getCleanupThresholdDate: jest.fn(),
  deleteOldNotifications: jest.fn(),
}));
jest.mock("../sync-helpers", () => ({
  handleSyncRoutinesRequest: jest.fn().mockResolvedValue(undefined),
}));

import type * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {
  deleteOldNotifications,
  getCleanupThresholdDate,
} from "../cleanup-helpers";
import { getCurrentNotificationContext } from "../date-utils";
import type { NotificationContext } from "../date-utils";
import { processAllUsersNotifications } from "../notification-helpers";
import { checkNotifications } from "../notifications";
import { cleanupNotifications } from "../notificationCleanup";
import { syncRoutines } from "../sync";
import { handleSyncRoutinesRequest } from "../sync-helpers";

type CapturedFunction = {
  options: Record<string, unknown>;
  handler: (...args: unknown[]) => Promise<void>;
};

/** モックの onSchedule / onRequest が返した設定と処理本体を取り出す */
const capture = (value: unknown) => value as CapturedFunction;

const db = { id: "db" } as unknown as admin.firestore.Firestore;

describe("Cloud Functions のエントリーポイント", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkNotifications", () => {
    const fn = capture(checkNotifications(db));

    it("毎分、東京リージョンで、JST のスケジュールとして起動する", () => {
      expect(fn.options).toEqual({
        schedule: "every 1 minutes",
        timeZone: "Asia/Tokyo",
        region: "asia-northeast1",
      });
    });

    it("起動時点のコンテキストで全ユーザーの通知処理を行う", async () => {
      const context: NotificationContext = {
        currentHour: 9,
        currentMinute: 0,
        currentDayOfWeek: 5,
        isHoliday: false,
        todayStr: "2026-10-30",
      };
      jest.mocked(getCurrentNotificationContext).mockReturnValue(context);

      await fn.handler();

      expect(processAllUsersNotifications).toHaveBeenCalledWith(db, context);
    });

    it("全ユーザーの処理の失敗はそのまま投げる（スケジューラーに失敗として残す）", async () => {
      jest
        .mocked(processAllUsersNotifications)
        .mockRejectedValueOnce(new Error("users read failed"));

      await expect(fn.handler()).rejects.toThrow("users read failed");
    });
  });

  describe("cleanupNotifications", () => {
    const fn = capture(cleanupNotifications(db));

    it("毎日 0 時（JST）に東京リージョンで起動する", () => {
      expect(fn.options).toEqual({
        schedule: "0 0 * * *",
        timeZone: "Asia/Tokyo",
        region: "asia-northeast1",
      });
    });

    it("閾値より古い送信履歴を削除し、件数をログに残す", async () => {
      const threshold = new Date("2026-10-29T00:00:00+09:00");
      jest.mocked(getCleanupThresholdDate).mockReturnValue(threshold);
      jest.mocked(deleteOldNotifications).mockResolvedValue(3);

      await fn.handler();

      expect(deleteOldNotifications).toHaveBeenCalledWith(db, threshold);
      expect(logger.info).toHaveBeenCalledWith("Deleted 3 old notifications");
    });
  });

  describe("syncRoutines", () => {
    const fn = capture(syncRoutines(db));

    it("東京リージョンの HTTPS 関数として公開する", () => {
      expect(fn.options).toEqual({ region: "asia-northeast1" });
    });

    it("リクエストとレスポンスを db とともに同期処理へ渡す", async () => {
      const req = { method: "POST" };
      const res = { status: jest.fn() };

      await fn.handler(req, res);

      expect(handleSyncRoutinesRequest).toHaveBeenCalledWith(req, res, db);
    });
  });
});
