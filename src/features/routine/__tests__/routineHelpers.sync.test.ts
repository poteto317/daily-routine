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
  beforeEach(() => {
    setupRoutineHelpersDefaults();
    mockHasNotificationPermission.mockReturnValue(true);
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
