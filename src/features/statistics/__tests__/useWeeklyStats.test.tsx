import { renderHook } from "@testing-library/react";

jest.mock("../statistics", () => ({
  calculateWeeklyStats: jest.fn(),
}));

import { calculateWeeklyStats } from "../statistics";
import { useWeeklyStats } from "../page/useWeeklyStats";

describe("useWeeklyStats", () => {
  it("weekly stats 計算を memo 化して返す", () => {
    const currentDate = new Date("2026-03-08T12:00:00.000Z");
    (calculateWeeklyStats as jest.Mock).mockReturnValue({
      weekStart: "2026-03-02",
    });

    const { result } = renderHook(() => useWeeklyStats(currentDate));

    expect(calculateWeeklyStats).toHaveBeenCalledWith(currentDate);
    expect(result.current).toEqual({ weekStart: "2026-03-02" });
  });
});
