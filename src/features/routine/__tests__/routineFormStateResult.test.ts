import { createRoutineFormStateResult } from "../components/routineFormStateResult";

describe("createRoutineFormStateResult", () => {
  it("context/fields/conflict/submit/day-toggle から公開 shape を組み立てる", () => {
    const result = createRoutineFormStateResult({
      contextData: {
        existingRoutines: [],
        defaultNotificationMinutes: 15,
        defaultDurationMinutes: 30,
        initialState: {} as never,
      },
      fieldsState: {
        title: "朝活",
        setTitle: jest.fn(),
        category: "work",
        setCategory: jest.fn(),
        daysOfWeek: [1, 2],
        setDaysOfWeek: jest.fn(),
        startTime: "07:00",
        setStartTime: jest.fn(),
        duration: "30",
        setDuration: jest.fn(),
        description: "準備",
        setDescription: jest.fn(),
        notificationMinutes: "10",
        setNotificationMinutes: jest.fn(),
        weeklyGoalTarget: "3",
        setWeeklyGoalTarget: jest.fn(),
      },
      conflictInfo: {
        hasConflict: false,
        conflictingRoutines: [],
      },
      submitState: {
        handleSubmit: jest.fn(),
        isSubmitDisabled: false,
        isWeeklyGoalTargetValid: true,
      },
      toggleDay: jest.fn(),
    });

    expect(result).toEqual({
      title: "朝活",
      setTitle: expect.any(Function),
      category: "work",
      setCategory: expect.any(Function),
      daysOfWeek: [1, 2],
      startTime: "07:00",
      setStartTime: expect.any(Function),
      duration: "30",
      setDuration: expect.any(Function),
      description: "準備",
      setDescription: expect.any(Function),
      notificationMinutes: "10",
      setNotificationMinutes: expect.any(Function),
      weeklyGoalTarget: "3",
      setWeeklyGoalTarget: expect.any(Function),
      isWeeklyGoalTargetValid: true,
      defaultNotificationMinutes: 15,
      defaultDurationMinutes: 30,
      conflictInfo: {
        hasConflict: false,
        conflictingRoutines: [],
      },
      toggleDay: expect.any(Function),
      handleSubmit: expect.any(Function),
      isSubmitDisabled: false,
    });
  });
});
