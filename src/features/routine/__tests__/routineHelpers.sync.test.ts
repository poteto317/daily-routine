import "./routineHelpers.test.setup";

jest.mock("@/features/notification", () => ({
  hasNotificationPermission: jest.fn(),
}));

import { deleteFCMToken } from "@/lib/firebase";
import { setCurrentUserId } from "@/lib/storage/core";
import { hasNotificationPermission } from "@/features/notification";
import { syncRoutinesToFirebase } from "../helpers";
import {
  baseRoutine,
  mockGetFCMToken,
  mockAuth,
  makeAuthUser,
  setupRoutineHelpersDefaults,
} from "./routineHelpers.test.setup";

const mockHasNotificationPermission =
  hasNotificationPermission as jest.MockedFunction<
    typeof hasNotificationPermission
  >;

describe("routine helpers sync", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setupRoutineHelpersDefaults();
    mockHasNotificationPermission.mockReturnValue(true);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("通知未許可ならトークン取得と送信を行わずfalseを返す", async () => {
    mockHasNotificationPermission.mockReturnValue(false);

    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(false);

    expect(mockGetFCMToken).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("トークンなし・URLなし・API失敗/成功を判定する", async () => {
    mockGetFCMToken.mockRejectedValueOnce(new Error("No token"));
    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(false);

    mockGetFCMToken.mockResolvedValueOnce("token");
    await expect(syncRoutinesToFirebase([baseRoutine])).resolves.toBe(false);

    mockGetFCMToken.mockResolvedValueOnce("token");
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500, statusText: "err" });
    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(false);

    mockGetFCMToken.mockResolvedValueOnce("token");
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(true);
  });
});

describe("syncRoutinesToFirebase の失敗経路と応答の検証", () => {
  const originalFetch = global.fetch;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    setupRoutineHelpersDefaults();
    mockHasNotificationPermission.mockReturnValue(true);
    mockGetFCMToken.mockResolvedValue("token");
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  /** ok な応答で、本文として body を返す */
  const respondWith = (body: unknown) =>
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => body });

  it("トークンとルーティンを JSON で POST する", async () => {
    respondWith({ success: true });

    await syncRoutinesToFirebase([baseRoutine], "https://test.com");

    expect(mockFetch).toHaveBeenCalledWith("https://test.com/syncRoutines", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer firebase-id-token",
      },
      redirect: "error",
      signal: expect.any(AbortSignal),
      body: JSON.stringify({
        token: "token",
        routines: [
          {
            id: baseRoutine.id,
            title: baseRoutine.title,
            startTime: baseRoutine.startTime,
            daysOfWeek: baseRoutine.daysOfWeek,
            notificationMinutes: baseRoutine.notificationMinutes,
          },
        ],
      }),
    });
  });

  it("Firebase 未認証なら端末トークン取得も通信もしない", async () => {
    mockAuth.currentUser = null;
    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(false);
    expect(mockGetFCMToken).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("HTTP の外部宛先へ認証情報を送らない", async () => {
    await expect(
      syncRoutinesToFirebase([baseRoutine], "http://test.com"),
    ).resolves.toBe(false);
    expect(mockGetFCMToken).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("ループバックの Emulator パスを保持する", async () => {
    respondWith({ success: true });
    await expect(
      syncRoutinesToFirebase(
        [baseRoutine],
        "http://127.0.0.1:5001/demo/asia-northeast1/",
      ),
    ).resolves.toBe(true);
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://127.0.0.1:5001/demo/asia-northeast1/syncRoutines",
    );
  });

  it.each(["new-owner", "routine-owner"])(
    "認証情報の取得中にセッションが変わったら送信しない（%s）",
    async (nextUid) => {
      mockAuth.currentUser?.getIdToken.mockImplementationOnce(async () => {
        mockAuth.currentUser = makeAuthUser(nextUid);
        setCurrentUserId(nextUid);
        return "old-id-token";
      });

      await expect(
        syncRoutinesToFirebase([baseRoutine], "https://test.com"),
      ).resolves.toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it.each(["new-owner", "routine-owner"])(
    "キュー待機中にセッションが変わった処理は送信しない（%s）",
    async (nextUid) => {
      let completeRequest: (value: object) => void = () => undefined;
      let signalStarted: () => void = () => undefined;
      const started = new Promise<void>((resolve) => {
        signalStarted = resolve;
      });
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            completeRequest = resolve;
            signalStarted();
          }),
      );
      const first = syncRoutinesToFirebase([baseRoutine], "https://test.com");
      await started;
      const queued = syncRoutinesToFirebase([], "https://test.com");
      mockAuth.currentUser = makeAuthUser(nextUid);
      setCurrentUserId(nextUid);
      completeRequest({ ok: true, json: async () => ({ success: true }) });
      await expect(first).resolves.toBe(true);
      await expect(queued).resolves.toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    },
  );

  it("所有者不一致だけ端末登録を更新し、同じ本人のまま一度だけ再試行する", async () => {
    mockGetFCMToken
      .mockResolvedValueOnce("old-device")
      .mockResolvedValueOnce("old-device")
      .mockResolvedValueOnce("updated-device");
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ code: "subscription-owner-mismatch" }),
    });
    respondWith({ success: true });
    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(true);
    expect(deleteFCMToken).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(mockFetch.mock.calls[1][1].body).token).toBe(
      "updated-device",
    );
  });

  it("別の理由の 403 では端末登録を変更しない", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "Forbidden" }),
    });
    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(false);
    expect(deleteFCMToken).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("呼び出し元の UID が現在と異なれば同期を始めない", async () => {
    await expect(
      syncRoutinesToFirebase(
        [baseRoutine],
        "https://test.com",
        "previous-owner",
      ),
    ).resolves.toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("トークンが空文字なら送信せずに false を返す", async () => {
    mockGetFCMToken.mockResolvedValueOnce("");

    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("通信に失敗したら拒否せず false を返す", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(false);
  });

  it("本文が JSON として読めなければ false を返す", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    });

    await expect(
      syncRoutinesToFirebase([baseRoutine], "https://test.com"),
    ).resolves.toBe(false);
  });

  it.each([
    ["success が文字列の true", { success: "true" }],
    ["success が 1", { success: 1 }],
    ["success が false", { success: false }],
    ["success が無い", {}],
    ["本文が null", null],
  ])(
    "%s なら false を返す（厳密に true のときだけ成功）",
    async (_label, body) => {
      respondWith(body);

      await expect(
        syncRoutinesToFirebase([baseRoutine], "https://test.com"),
      ).resolves.toBe(false);
    },
  );
});
