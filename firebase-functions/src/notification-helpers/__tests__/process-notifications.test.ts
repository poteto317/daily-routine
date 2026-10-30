/** @jest-environment node */
jest.mock("../notification-delivery", () => ({
  sendRoutineNotification: jest.fn().mockResolvedValue(true),
}));

import type * as admin from "firebase-admin";
import { HOLIDAY_DAY_VALUE } from "../../constants";
import type { NotificationContext } from "../../date-utils";
import type { Routine } from "../../types";
import { sendRoutineNotification } from "../notification-delivery";
import { processUserNotifications } from "../process-user-notifications";
import { processAllUsersNotifications } from "../users-processor";

const mockedSend = jest.mocked(sendRoutineNotification);
const db = {} as admin.firestore.Firestore;

/** 2026-10-30（金）09:00 の平日 */
const CONTEXT: NotificationContext = {
  currentHour: 9,
  currentMinute: 0,
  currentDayOfWeek: 5,
  isHoliday: false,
  todayStr: "2026-10-30",
};

const makeRoutine = (overrides: Partial<Routine> = {}): Routine => ({
  id: "routine-1",
  title: "朝の運動",
  startTime: "09:00",
  daysOfWeek: [1, 2, 3, 4, 5],
  isActive: true,
  ...overrides,
});

const sentRoutineIds = () =>
  mockedSend.mock.calls.map(([, routine]) => routine.id);

describe("processUserNotifications", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("曜日と通知時刻が一致するルーティンだけ送信する", async () => {
    const routines = [
      makeRoutine({ id: "match" }),
      makeRoutine({ id: "other-time", startTime: "09:01" }),
      makeRoutine({ id: "other-day", daysOfWeek: [0, 6] }),
    ];

    await processUserNotifications({
      userData: { fcmToken: "tok", routines },
      db,
      ...CONTEXT,
    });

    expect(sentRoutineIds()).toEqual(["match"]);
    expect(mockedSend).toHaveBeenCalledWith(
      "tok",
      routines[0],
      db,
      CONTEXT.todayStr,
    );
  });

  it("notificationMinutes を加味した時刻で判定する", async () => {
    const routines = [
      makeRoutine({
        id: "delayed",
        startTime: "08:45",
        notificationMinutes: 15,
      }),
      makeRoutine({ id: "start-only", startTime: "08:45" }),
    ];

    await processUserNotifications({
      userData: { fcmToken: "tok", routines },
      db,
      ...CONTEXT,
    });

    expect(sentRoutineIds()).toEqual(["delayed"]);
  });

  it("時だけ・分だけ一致しても送信しない", async () => {
    const routines = [
      makeRoutine({ id: "hour-only", startTime: "09:30" }),
      makeRoutine({ id: "minute-only", startTime: "10:00" }),
    ];

    await processUserNotifications({
      userData: { fcmToken: "tok", routines },
      db,
      ...CONTEXT,
    });

    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("祝日は祝日指定のあるルーティンだけ送信する", async () => {
    const routines = [
      makeRoutine({ id: "weekday" }),
      makeRoutine({ id: "holiday", daysOfWeek: [HOLIDAY_DAY_VALUE] }),
    ];

    await processUserNotifications({
      userData: { fcmToken: "tok", routines },
      db,
      ...CONTEXT,
      isHoliday: true,
    });

    expect(sentRoutineIds()).toEqual(["holiday"]);
  });

  it("トークンかルーティンが無いユーザーは何もしない", async () => {
    await processUserNotifications({
      userData: { routines: [makeRoutine()] },
      db,
      ...CONTEXT,
    });
    await processUserNotifications({
      userData: { fcmToken: "tok", routines: [] },
      db,
      ...CONTEXT,
    });

    expect(mockedSend).not.toHaveBeenCalled();
  });
});

describe("processAllUsersNotifications", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const makeDb = (users: admin.firestore.DocumentData[]) => {
    const collection = jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        docs: users.map((data) => ({ data: () => data })),
      }),
    }));
    return {
      db: { collection } as unknown as admin.firestore.Firestore,
      collection,
    };
  };

  it("users の全ドキュメントについて通知処理を行う", async () => {
    const { db: usersDb, collection } = makeDb([
      { fcmToken: "tok-a", routines: [makeRoutine({ id: "a" })] },
      { fcmToken: "tok-b", routines: [makeRoutine({ id: "b" })] },
    ]);

    await processAllUsersNotifications(usersDb, CONTEXT);

    expect(collection).toHaveBeenCalledWith("users");
    expect(mockedSend.mock.calls.map(([token]) => token)).toEqual([
      "tok-a",
      "tok-b",
    ]);
  });

  it("ユーザーがいなければ送信しない", async () => {
    const { db: usersDb } = makeDb([]);

    await processAllUsersNotifications(usersDb, CONTEXT);

    expect(mockedSend).not.toHaveBeenCalled();
  });
});
