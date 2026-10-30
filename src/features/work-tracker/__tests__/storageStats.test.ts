import { getTemplateStats, getWorkNameStats } from "../storageStats";
import {
  getSessionsByTemplateId,
  getSessionsByWorkName,
} from "../storageSessions";

jest.mock("../storageSessions", () => ({
  getSessionsByTemplateId: jest.fn(),
  getSessionsByWorkName: jest.fn(),
}));

const sessions = (durations: Array<number | undefined>) =>
  durations.map((duration) => ({ duration }));

describe("storageStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTemplateStats", () => {
    it("テンプレート ID のセッションの所要時間を集計する", () => {
      (getSessionsByTemplateId as jest.Mock).mockReturnValue(
        sessions([60, 120, 90]),
      );

      const stats = getTemplateStats("t1");

      expect(getSessionsByTemplateId).toHaveBeenCalledWith("t1");
      expect(stats.count).toBe(3);
      expect(stats.averageDuration).toBe(90);
      expect(stats.bestDuration).toBe(60);
      expect(stats.latestDuration).toBe(60);
    });

    it("セッションが無ければ空の集計を返す", () => {
      (getSessionsByTemplateId as jest.Mock).mockReturnValue([]);

      expect(getTemplateStats("none")).toEqual({
        count: 0,
        averageDuration: 0,
        bestDuration: 0,
        latestDuration: 0,
        trend: "first",
      });
    });

    it("所要時間が未設定のセッションは 0 として数え、平均には入れない", () => {
      (getSessionsByTemplateId as jest.Mock).mockReturnValue(
        sessions([undefined, 100]),
      );

      const stats = getTemplateStats("t1");

      expect(stats.count).toBe(2);
      expect(stats.averageDuration).toBe(100);
      expect(stats.bestDuration).toBe(100);
    });
  });

  describe("getWorkNameStats", () => {
    it("作業名のセッションの所要時間を集計する", () => {
      (getSessionsByWorkName as jest.Mock).mockReturnValue(sessions([30, 50]));

      const stats = getWorkNameStats("読書");

      expect(getSessionsByWorkName).toHaveBeenCalledWith("読書");
      expect(stats.count).toBe(2);
      expect(stats.averageDuration).toBe(40);
      expect(stats.bestDuration).toBe(30);
    });

    it("セッションが無ければ空の集計を返す", () => {
      (getSessionsByWorkName as jest.Mock).mockReturnValue([]);

      expect(getWorkNameStats("none").count).toBe(0);
      expect(getWorkNameStats("none").trend).toBe("first");
    });

    it("所要時間が未設定のセッションだけなら件数だけ数える", () => {
      (getSessionsByWorkName as jest.Mock).mockReturnValue(
        sessions([undefined, 0]),
      );

      expect(getWorkNameStats("x")).toEqual({
        count: 2,
        averageDuration: 0,
        bestDuration: 0,
        latestDuration: 0,
        trend: "first",
      });
    });
  });
});
