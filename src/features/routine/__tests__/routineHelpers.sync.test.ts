import "./routineHelpers.test.setup";
import { syncRoutinesToFirebase } from "../helpers";
import {
  baseRoutine,
  mockGetFCMToken,
  setupRoutineHelpersDefaults,
} from "./routineHelpers.test.setup";

describe("routine helpers sync", () => {
  beforeEach(setupRoutineHelpersDefaults);

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
