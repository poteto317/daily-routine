import {
  getWeightRecordsByPeriod,
  getLatestWeightRecord,
} from "../storageQueries";
import * as storageData from "../storageData";

jest.mock("../storageData");

const mockGetWeightHistory = storageData.getWeightHistory as jest.MockedFunction<
  typeof storageData.getWeightHistory
>;

describe("weight-tracker storageQueries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWeightRecordsByPeriod", () => {
    it("指定期間内の記録を日付昇順で取得する", () => {
      mockGetWeightHistory.mockReturnValue({
        "2026-03-01": {
          id: "1",
          date: "2026-03-01",
          weight: 65,
          createdAt: "",
          updatedAt: "",
        },
        "2026-03-05": {
          id: "2",
          date: "2026-03-05",
          weight: 64.5,
          createdAt: "",
          updatedAt: "",
        },
        "2026-03-10": {
          id: "3",
          date: "2026-03-10",
          weight: 64,
          createdAt: "",
          updatedAt: "",
        },
      });

      const records = getWeightRecordsByPeriod("2026-03-02", "2026-03-09");
      expect(records).toHaveLength(1);
      expect(records[0].date).toBe("2026-03-05");
    });
  });

  describe("getLatestWeightRecord", () => {
    it("履歴が空の場合はnullを返す", () => {
      mockGetWeightHistory.mockReturnValue({});

      const latest = getLatestWeightRecord();
      expect(latest).toBeNull();
    });

    it("最新日付の記録を返す", () => {
      mockGetWeightHistory.mockReturnValue({
        "2026-03-01": {
          id: "1",
          date: "2026-03-01",
          weight: 65,
          createdAt: "",
          updatedAt: "",
        },
        "2026-03-10": {
          id: "3",
          date: "2026-03-10",
          weight: 64,
          createdAt: "",
          updatedAt: "",
        },
      });

      const latest = getLatestWeightRecord();
      expect(latest?.date).toBe("2026-03-10");
    });
  });
});
