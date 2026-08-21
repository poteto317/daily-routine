import { renderHook } from "@testing-library/react";

jest.mock("../components/useRoutineMetaFieldsState", () => ({
  useRoutineMetaFieldsState: jest.fn(),
}));

jest.mock("../components/useRoutineScheduleFieldsState", () => ({
  useRoutineScheduleFieldsState: jest.fn(),
}));

jest.mock("../components/useRoutineNotificationFieldState", () => ({
  useRoutineNotificationFieldState: jest.fn(),
}));

import { useRoutineFormFieldsState } from "../components/useRoutineFormFieldsState";
import { useRoutineMetaFieldsState } from "../components/useRoutineMetaFieldsState";
import { useRoutineNotificationFieldState } from "../components/useRoutineNotificationFieldState";
import { useRoutineScheduleFieldsState } from "../components/useRoutineScheduleFieldsState";

describe("useRoutineFormFieldsState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("meta/schedule/notification hooks を compose する", () => {
    const initialState = {
      title: "朝活",
      category: "work" as const,
      daysOfWeek: [1, 2],
      startTime: "07:00",
      duration: "30",
      description: "準備",
      notificationMinutes: "10",
      weeklyGoalTarget: "3",
    };
    const metaState = {
      title: "朝活",
      setTitle: jest.fn(),
      category: "work",
      setCategory: jest.fn(),
      description: "準備",
      setDescription: jest.fn(),
      weeklyGoalTarget: "3",
      setWeeklyGoalTarget: jest.fn(),
    };
    const scheduleState = {
      daysOfWeek: [1, 2],
      setDaysOfWeek: jest.fn(),
      startTime: "07:00",
      setStartTime: jest.fn(),
      duration: "30",
      setDuration: jest.fn(),
    };
    const notificationState = {
      notificationMinutes: "10",
      setNotificationMinutes: jest.fn(),
    };

    (useRoutineMetaFieldsState as jest.Mock).mockReturnValue(metaState);
    (useRoutineScheduleFieldsState as jest.Mock).mockReturnValue(scheduleState);
    (useRoutineNotificationFieldState as jest.Mock).mockReturnValue(
      notificationState,
    );

    const { result } = renderHook(() =>
      useRoutineFormFieldsState(initialState),
    );

    expect(useRoutineMetaFieldsState).toHaveBeenCalledWith({
      initialTitle: "朝活",
      initialCategory: "work",
      initialDescription: "準備",
      initialWeeklyGoalTarget: "3",
    });
    expect(useRoutineScheduleFieldsState).toHaveBeenCalledWith({
      initialDaysOfWeek: [1, 2],
      initialStartTime: "07:00",
      initialDuration: "30",
    });
    expect(useRoutineNotificationFieldState).toHaveBeenCalledWith({
      initialNotificationMinutes: "10",
    });
    expect(result.current).toEqual({
      ...metaState,
      ...scheduleState,
      ...notificationState,
    });
  });
});
