import { renderHook } from "@testing-library/react";

jest.mock("../statistics", () => ({
  calculateMonthlyStats: jest.fn(),
}));

import { calculateMonthlyStats } from "../statistics";
import { useMonthlyStats } from "../page/useMonthlyStats";

describe("useMonthlyStats", () => {
  it("monthly stats 計算を memo 化して返す", () => {
    (calculateMonthlyStats as jest.Mock).mockReturnValue({
      totalCompleted: 20,
    });

    const { result } = renderHook(() => useMonthlyStats(2026, 3));

    expect(calculateMonthlyStats).toHaveBeenCalledWith(2026, 3);
    expect(result.current).toEqual({ totalCompleted: 20 });
  });
});
