import { createNotificationSchedules } from "../notification-helpers";
import { HOLIDAY_DAY_VALUE, type Routine } from "@/types/routine";

describe("createNotificationSchedules", () => {
  it("notificationMinutesが未設定のルーティンはスキップする", () => {
    const routines = [
      {
        id: "r1",
        title: "未通知",
        startTime: "08:00",
        notificationMinutes: undefined,
        daysOfWeek: [1, 2],
      },
      {
        id: "r2",
        title: "有効",
        startTime: "09:00",
        notificationMinutes: 10,
        daysOfWeek: [1],
      },
    ] as Routine[];

    const result = createNotificationSchedules(routines);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "r2-1",
      time: "09:00",
      minutesAfter: 10,
      dayOfWeek: 1,
    });
  });

  it("通常曜日と祝日で適切なスケジュールを生成する", () => {
    const routines = [
      {
        id: "r1",
        title: "朝活",
        startTime: "07:00",
        notificationMinutes: 15,
        daysOfWeek: [0, HOLIDAY_DAY_VALUE],
      },
    ] as Routine[];

    const result = createNotificationSchedules(routines);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(
      expect.objectContaining({
        id: "r1-0",
        dayOfWeek: 0,
        minutesAfter: 15,
      }),
    );
    expect(result).toContainEqual(
      expect.objectContaining({
        id: "r1-holiday",
        isHoliday: true,
        minutesAfter: 15,
      }),
    );
  });

  it("notificationMinutesが0のルーティンはスキップする", () => {
    const routines = [
      {
        id: "r1",
        title: "ゼロ分通知",
        startTime: "10:00",
        notificationMinutes: 0,
        daysOfWeek: [3],
      },
    ] as Routine[];

    const result = createNotificationSchedules(routines);

    expect(result).toEqual([]);
  });
});
