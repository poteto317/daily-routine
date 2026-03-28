import { renderHook } from "@testing-library/react";

jest.mock("../components/useRoutineFormContextData", () => ({
  useRoutineFormContextData: jest.fn(),
}));

jest.mock("../components/useRoutineFormFieldsState", () => ({
  useRoutineFormFieldsState: jest.fn(),
}));

jest.mock("../components/useRoutineConflictInfo", () => ({
  useRoutineConflictInfo: jest.fn(),
}));

jest.mock("../components/useRoutineDayToggleAction", () => ({
  useRoutineDayToggleAction: jest.fn(),
}));

jest.mock("../components/useRoutineFormSubmitHandler", () => ({
  useRoutineFormSubmitHandler: jest.fn(),
}));

jest.mock("../components/routineFormStateResult", () => ({
  createRoutineFormStateResult: jest.fn(),
}));

import { createRoutineFormStateResult } from "../components/routineFormStateResult";
import { useRoutineConflictInfo } from "../components/useRoutineConflictInfo";
import { useRoutineDayToggleAction } from "../components/useRoutineDayToggleAction";
import { useRoutineFormContextData } from "../components/useRoutineFormContextData";
import { useRoutineFormFieldsState } from "../components/useRoutineFormFieldsState";
import { useRoutineFormState } from "../components/useRoutineFormState";
import { useRoutineFormSubmitHandler } from "../components/useRoutineFormSubmitHandler";

describe("useRoutineFormState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("context/fields/conflict/day toggle/submit hook を compose する", () => {
    const routine = { id: "r1" } as never;
    const onSubmit = jest.fn();
    const fieldsState = {
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
    };
    const conflictInfo = { hasConflict: false, conflictingRoutines: [] };
    const toggleDay = jest.fn();
    const handleSubmit = jest.fn();
    const builtResult = { formState: true };

    (useRoutineFormContextData as jest.Mock).mockReturnValue({
      existingRoutines: [],
      defaultNotificationMinutes: 5,
      defaultDurationMinutes: 30,
      initialState: fieldsState,
      groupDaysOfWeek: [1, 2],
    });
    (useRoutineFormFieldsState as jest.Mock).mockReturnValue(fieldsState);
    (useRoutineConflictInfo as jest.Mock).mockReturnValue(conflictInfo);
    (useRoutineDayToggleAction as jest.Mock).mockReturnValue(toggleDay);
    (useRoutineFormSubmitHandler as jest.Mock).mockReturnValue({
      isSubmitDisabled: false,
      handleSubmit,
    });
    (createRoutineFormStateResult as jest.Mock).mockReturnValue(builtResult);

    const { result } = renderHook(() =>
      useRoutineFormState({
        routine,
        currentDayOfWeek: 1,
        onSubmit,
      }),
    );

    expect(useRoutineFormContextData).toHaveBeenCalledWith({
      routine,
      currentDayOfWeek: 1,
    });
    expect(useRoutineFormFieldsState).toHaveBeenCalledWith(fieldsState);
    expect(useRoutineConflictInfo).toHaveBeenCalledWith({
      startTime: fieldsState.startTime,
      duration: fieldsState.duration,
      defaultDurationMinutes: 30,
      existingRoutines: [],
      routineId: "r1",
      daysOfWeek: fieldsState.daysOfWeek,
    });
    expect(useRoutineDayToggleAction).toHaveBeenCalledWith({
      setDaysOfWeek: fieldsState.setDaysOfWeek,
    });
    expect(useRoutineFormSubmitHandler).toHaveBeenCalledWith({
      routine,
      title: fieldsState.title,
      category: fieldsState.category,
      daysOfWeek: fieldsState.daysOfWeek,
      startTime: fieldsState.startTime,
      duration: fieldsState.duration,
      description: fieldsState.description,
      notificationMinutes: fieldsState.notificationMinutes,
      defaultDurationMinutes: 30,
      groupDaysOfWeek: [1, 2],
      hasConflict: false,
      onSubmit,
    });
    expect(createRoutineFormStateResult).toHaveBeenCalledWith({
      conflictInfo,
      contextData: {
        existingRoutines: [],
        defaultNotificationMinutes: 5,
        defaultDurationMinutes: 30,
        initialState: fieldsState,
        groupDaysOfWeek: [1, 2],
      },
      fieldsState,
      submitState: {
        isSubmitDisabled: false,
        handleSubmit,
      },
      toggleDay,
    });
    expect(result.current).toBe(builtResult);
  });
});
