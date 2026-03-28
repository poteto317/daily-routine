import "./routineHelpers.test.setup";
import { getRoutinesNeedingNotification } from "../helpers";
import {
  baseRoutine,
  setupRoutineHelpersDefaults,
} from "./routineHelpers.test.setup";

describe("routine helpers notification filter", () => {
  beforeEach(setupRoutineHelpersDefaults);

  it("通知時刻超過のみ返し、通知未設定と完了済みを除外する", () => {
    const routines = [
      {
        ...baseRoutine,
        id: "1",
        title: "Morning",
        startTime: "09:00",
        notificationMinutes: 10,
        isCompleted: false,
      },
      {
        ...baseRoutine,
        id: "2",
        title: "Lunch",
        startTime: "12:00",
        notificationMinutes: 0,
        isCompleted: false,
      },
      {
        ...baseRoutine,
        id: "3",
        title: "Done",
        startTime: "09:00",
        notificationMinutes: 10,
        isCompleted: true,
      },
    ];

    const result = getRoutinesNeedingNotification(
      routines,
      new Date("2024-01-01T09:15:00"),
    );
    expect(result.map((routine) => routine.id)).toEqual(["1"]);
  });
});
