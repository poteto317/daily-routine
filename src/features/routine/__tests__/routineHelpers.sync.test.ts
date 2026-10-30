import "./routineHelpers.test.setup";

jest.mock("@/features/notification", () => ({
  hasNotificationPermission: jest.fn(),
}));

import { hasNotificationPermission } from "@/features/notification";
import { syncRoutinesToFirebase } from "../helpers";
import {
  baseRoutine,
  mockGetFCMToken,
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
      syncRoutinesToFirebase([baseRoutine], "http://test.com"),
    ).resolves.toBe(false);

    expect(mockGetFCMToken).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("トークンなし・URLなし・API失敗/成功を判定する", async () => {
    mockGetFCMToken.mockRejectedValueOnce(new Error("No token"));
    await expect(
      syncRoutinesToFirebase([baseRoutine], "http://test.com"),
    ).resolves.toBe(false);

    mockGetFCMToken.mockResolvedValueOnce("token");
    await expect(syncRoutinesToFirebase([baseRoutine])).resolves.toBe(false);

    mockGetFCMToken.mockResolvedValueOnce("token");
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500, statusText: "err" });
    await expect(
      syncRoutinesToFirebase([baseRoutine], "http://test.com"),
    ).resolves.toBe(false);

    mockGetFCMToken.mockResolvedValueOnce("token");
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    await expect(
      syncRoutinesToFirebase([baseRoutine], "http://test.com"),
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

    await syncRoutinesToFirebase([baseRoutine], "http://test.com");

    expect(mockFetch).toHaveBeenCalledWith("http://test.com/syncRoutines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "token", routines: [baseRoutine] }),
    });
  });

  it("トークンが空文字なら送信せずに false を返す", async () => {
    mockGetFCMToken.mockResolvedValueOnce("");

    await expect(
      syncRoutinesToFirebase([baseRoutine], "http://test.com"),
    ).resolves.toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("通信に失敗したら拒否せず false を返す", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(
      syncRoutinesToFirebase([baseRoutine], "http://test.com"),
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
      syncRoutinesToFirebase([baseRoutine], "http://test.com"),
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
        syncRoutinesToFirebase([baseRoutine], "http://test.com"),
      ).resolves.toBe(false);
    },
  );
});
