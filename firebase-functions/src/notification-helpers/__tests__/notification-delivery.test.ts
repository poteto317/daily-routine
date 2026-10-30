/** @jest-environment node */
const mockSend = jest.fn();

jest.mock("firebase-admin", () => ({
  messaging: () => ({ send: mockSend }),
  firestore: {
    FieldValue: { serverTimestamp: () => "SERVER_TIMESTAMP" },
  },
}));
jest.mock("firebase-functions/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

import type * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import type { Routine } from "../../types";
import { sendRoutineNotification } from "../notification-delivery";
import {
  hasNotificationBeenSent,
  recordSentNotification,
} from "../notification-history";
import { buildRoutineNotificationMessage } from "../notification-message";

const TODAY = "2026-10-30";
const TOKEN = "fcm-token-0123456789-abcdef";
const NOTIFICATION_ID = `${TOKEN}_routine-1_${TODAY}`;

const routine: Routine = {
  id: "routine-1",
  title: "朝の運動",
  startTime: "09:00",
  daysOfWeek: [1, 2, 3, 4, 5],
  isActive: true,
};

/** notifications_sent コレクションだけを持つ Firestore のフェイク */
const makeDb = (alreadySent = false) => {
  const get = jest.fn().mockResolvedValue({ exists: alreadySent });
  const set = jest.fn().mockResolvedValue(undefined);
  const doc = jest.fn(() => ({ get, set }));
  const collection = jest.fn(() => ({ doc }));
  return {
    db: { collection } as unknown as admin.firestore.Firestore,
    collection,
    doc,
    get,
    set,
  };
};

describe("notification-history", () => {
  it("hasNotificationBeenSent はドキュメントの有無を返す", async () => {
    const sent = makeDb(true);
    await expect(hasNotificationBeenSent(sent.db, "id-1")).resolves.toBe(true);
    expect(sent.collection).toHaveBeenCalledWith("notifications_sent");
    expect(sent.doc).toHaveBeenCalledWith("id-1");

    const notSent = makeDb(false);
    await expect(hasNotificationBeenSent(notSent.db, "id-1")).resolves.toBe(
      false,
    );
  });

  it("recordSentNotification はルーティン情報と送信時刻を保存する", async () => {
    const { db, doc, set } = makeDb();

    await recordSentNotification(db, "id-1", routine);

    expect(doc).toHaveBeenCalledWith("id-1");
    expect(set).toHaveBeenCalledWith({
      routineId: "routine-1",
      routineTitle: "朝の運動",
      sentAt: "SERVER_TIMESTAMP",
    });
  });
});

describe("sendRoutineNotification", () => {
  beforeEach(() => {
    mockSend.mockResolvedValue("message-id");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("未送信なら FCM で送信し、送信履歴を記録して true を返す", async () => {
    const { db, doc, set } = makeDb(false);

    const result = await sendRoutineNotification(TOKEN, routine, db, TODAY);

    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      buildRoutineNotificationMessage(TOKEN, routine),
    );
    expect(doc).toHaveBeenCalledWith(NOTIFICATION_ID);
    expect(set).toHaveBeenCalledTimes(1);
  });

  it("本日送信済みなら送信も記録もせず false を返す", async () => {
    const { db, set } = makeDb(true);

    const result = await sendRoutineNotification(TOKEN, routine, db, TODAY);

    expect(result).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
  });

  it("FCM の送信に失敗したら記録せず、エラーをログに残して false を返す", async () => {
    const error = new Error("invalid token");
    mockSend.mockRejectedValue(error);
    const { db, set } = makeDb(false);

    const result = await sendRoutineNotification(TOKEN, routine, db, TODAY);

    expect(result).toBe(false);
    expect(set).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("朝の運動"),
      error,
    );
  });

  it("送信履歴の記録に失敗しても例外を投げず false を返す", async () => {
    const { db, set } = makeDb(false);
    set.mockRejectedValue(new Error("write failed"));

    await expect(
      sendRoutineNotification(TOKEN, routine, db, TODAY),
    ).resolves.toBe(false);
  });

  // 送信済み確認は try の外にあるため、読み取りの失敗は呼び出し元へ伝わる
  it("送信済みの確認に失敗したら送信せず例外を投げる", async () => {
    const { db, get } = makeDb(false);
    get.mockRejectedValue(new Error("read failed"));

    await expect(
      sendRoutineNotification(TOKEN, routine, db, TODAY),
    ).rejects.toThrow("read failed");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("ログにはトークンの先頭 20 文字だけを出す", async () => {
    const { db } = makeDb(false);

    await sendRoutineNotification(TOKEN, routine, db, TODAY);

    const message = String(jest.mocked(logger.info).mock.calls[0][0]);
    expect(message).toContain(TOKEN.substring(0, 20));
    expect(message).not.toContain(TOKEN);
  });
});
