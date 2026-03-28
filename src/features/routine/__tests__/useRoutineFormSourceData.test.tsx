import { renderHook } from "@testing-library/react";

jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(),
}));

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(),
}));

import { getRoutines } from "@/features/routine/storage";
import { getSettings } from "@/features/settings/storage";
import { useRoutineFormSourceData } from "../components/useRoutineFormSourceData";

describe("useRoutineFormSourceData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSettings as jest.Mock).mockReturnValue({
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 15,
    });
    (getRoutines as jest.Mock).mockReturnValue([{ id: "r1" }]);
  });

  it("settings と routines の取得結果を返す", () => {
    const { result, rerender } = renderHook(() => useRoutineFormSourceData());

    expect(result.current).toEqual({
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 15,
      existingRoutines: [{ id: "r1" }],
    });

    rerender();

    expect(getSettings).toHaveBeenCalledTimes(1);
    expect(getRoutines).toHaveBeenCalledTimes(1);
  });
});
