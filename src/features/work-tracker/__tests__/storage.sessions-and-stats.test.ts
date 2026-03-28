import {
  addWorkSession,
  deleteWorkSession,
  getAllWorkSessions,
  getTemplateStats,
  getTodayWorkSessions,
  updateWorkSession,
} from "../storage";
import {
  mockCalculateSessionStats,
  mockGetStorageItem,
  mockSetStorageItem,
  setupDefaultStorageMocks,
} from "./storage.test-utils";

jest.mock("@/lib/storage/core");

describe("work-tracker storage sessions/stats", () => {
  beforeEach(() => setupDefaultStorageMocks());

  it("add/update/deleteWorkSessionが当日履歴を更新する", () => {
    const history = {
      "2026-02-12": [
        {
          id: "s1",
          workTemplateId: "t1",
          workName: "設計",
          createdAt: "2026-02-12T09:00:00.000Z",
        },
      ],
    };
    mockGetStorageItem.mockReturnValue(history as never);

    addWorkSession({
      id: "s2",
      workTemplateId: "t1",
      workName: "実装",
      mood: "good",
      startTime: "2026-02-12T10:00:00.000Z",
      createdAt: "2026-02-12T10:00:00.000Z",
    } as never);

    updateWorkSession("s2", { notes: "集中できた" });
    deleteWorkSession("s1");

    const lastSaveCall = (mockSetStorageItem as jest.Mock).mock.calls.at(-1);
    expect(lastSaveCall[0]).toBe("work-sessions");
    expect(lastSaveCall[1]["2026-02-12"]).toEqual([
      expect.objectContaining({ id: "s2", notes: "集中できた" }),
    ]);
  });

  it("getTodayWorkSessions/getAllWorkSessions/getTemplateStatsが集計できる", () => {
    const history = {
      "2026-02-12": [
        {
          id: "s1",
          workTemplateId: "t1",
          workName: "設計",
          createdAt: "2026-02-12T09:00:00.000Z",
          duration: 120,
        },
      ],
      "2026-02-11": [
        {
          id: "s2",
          workTemplateId: "t1",
          workName: "実装",
          createdAt: "2026-02-11T09:00:00.000Z",
          duration: 180,
        },
      ],
    };
    mockGetStorageItem.mockReturnValue(history as never);
    mockCalculateSessionStats.mockReturnValue({
      count: 2,
      total: 300,
    } as never);

    const today = getTodayWorkSessions();
    const all = getAllWorkSessions();
    const stats = getTemplateStats("t1");

    expect(today).toHaveLength(1);
    expect(all[0].id).toBe("s1");
    expect(all[1].id).toBe("s2");
    expect(mockCalculateSessionStats).toHaveBeenCalledWith([120, 180]);
    expect(stats).toEqual({ count: 2, total: 300 });
  });
});
