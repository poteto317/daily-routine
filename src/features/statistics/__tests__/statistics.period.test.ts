import { mockGetMonthlyHistory } from "./statisticsTestUtils";
import { calculatePeriodStats } from "../statistics";

describe("calculatePeriodStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMonthlyHistory.mockReturnValue({});
  });

  it("期間内の日数分の統計を返す", () => {
    const result = calculatePeriodStats("2024-01-10", "2024-01-15");
    expect(result).toHaveLength(6);
    expect(result[0].date).toBe("2024-01-10");
    expect(result[5].date).toBe("2024-01-15");
  });

  it("同日指定は1日分、月またぎも処理する", () => {
    expect(calculatePeriodStats("2024-01-15", "2024-01-15")).toHaveLength(1);
    const result = calculatePeriodStats("2024-01-30", "2024-02-02");
    expect(result).toHaveLength(4);
    expect(result[0].date).toBe("2024-01-30");
    expect(result[3].date).toBe("2024-02-02");
  });
});
