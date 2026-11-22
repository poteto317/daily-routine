/** @jest-environment node */
const mockSend = jest.fn();

jest.mock("../../adminSdk", () => ({
  FieldValue: { serverTimestamp: () => "SERVER_TIMESTAMP" },
  getMessaging: () => ({ send: mockSend }),
}));
jest.mock("firebase-functions/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

import { createHash } from "node:crypto";
import type { Firestore } from "../../adminSdk";
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
const deliveryId = createHash("sha256").update(NOTIFICATION_ID).digest("hex");

const routine: Routine = {
  id: "routine-1",
  title: "朝の運動",
  startTime: "09:00",
  daysOfWeek: [1, 2, 3, 4, 5],
  isActive: true,
};

const sdkError = () =>
  new Error(`SDK failure: ${routine.title} ${NOTIFICATION_ID}`);

/** notifications_sent コレクションだけを持つ Firestore のフェイク */
const makeDb = (alreadySent = false) => {
  const get = jest.fn().mockResolvedValue({ exists: alreadySent });
  const set = jest.fn().mockResolvedValue(undefined);
  const doc = jest.fn(() => ({ get, set }));
  const collection = jest.fn(() => ({ doc }));
  return {
    db: { collection } as unknown as Firestore,
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
    expect(jest.mocked(logger.info).mock.calls).toEqual([
      ["Notification sent", { deliveryId }],
    ]);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("本日送信済みなら送信も記録もせず false を返す", async () => {
    const { db, set } = makeDb(true);

    const result = await sendRoutineNotification(TOKEN, routine, db, TODAY);

    expect(result).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
    expect(jest.mocked(logger.info).mock.calls).toEqual([
      ["Notification already sent", { deliveryId }],
    ]);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("FCM の送信に失敗したら診断用 ID だけをログに残して false を返す", async () => {
    mockSend.mockRejectedValue(sdkError());
    const { db, set } = makeDb();

    await expect(
      sendRoutineNotification(TOKEN, routine, db, TODAY),
    ).resolves.toBe(false);

    expect(set).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
    expect(jest.mocked(logger.error).mock.calls).toEqual([
      ["Notification send failed", { deliveryId }],
    ]);
  });

  it("履歴の記録に失敗したら送信とは異なる固定メッセージを残して false を返す", async () => {
    const { db, set } = makeDb();
    set.mockRejectedValue(sdkError());

    await expect(
      sendRoutineNotification(TOKEN, routine, db, TODAY),
    ).resolves.toBe(false);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(logger.info).not.toHaveBeenCalled();
    expect(jest.mocked(logger.error).mock.calls).toEqual([
      ["Notification history write failed", { deliveryId }],
    ]);
  });

  it("履歴の確認に失敗したら送信せず、上位に安全な例外だけを伝える", async () => {
    const { db, get, set } = makeDb();
    const original = sdkError();
    get.mockRejectedValue(original);

    const error = await sendRoutineNotification(
      TOKEN,
      routine,
      db,
      TODAY,
    ).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBe(original);
    expect(error).toHaveProperty(
      "message",
      `Notification history lookup failed (${deliveryId})`,
    );
    expect(error).not.toHaveProperty("cause");
    expect(mockSend).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
