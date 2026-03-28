import { renderHook } from "@testing-library/react";

jest.mock("../statistics", () => ({
  calculateCategoryStats: jest.fn(),
}));

import { calculateCategoryStats } from "../statistics";
import { useCategoryStats } from "../page/useCategoryStats";

describe("useCategoryStats", () => {
  it("category stats 計算を memo 化して返す", () => {
    (calculateCategoryStats as jest.Mock).mockReturnValue([
      { category: "work", totalCompleted: 10 },
    ]);

    const { result } = renderHook(() => useCategoryStats(2026, 3));

    expect(calculateCategoryStats).toHaveBeenCalledWith(2026, 3);
    expect(result.current).toEqual([{ category: "work", totalCompleted: 10 }]);
  });
});
