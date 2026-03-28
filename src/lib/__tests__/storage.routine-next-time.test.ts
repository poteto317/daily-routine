import { findNextAvailableTime } from "../storage";
import { createRoutine } from "./storage.test-utils";

describe("storage findNextAvailableTime", () => {
  it("ルーティンがない場合はデフォルト時刻を返す", () => {
    expect(findNextAvailableTime([], 540, 30)).toBe("09:00");
  });

  it("重複しない次の時間を見つける", () => {
    const routines = [createRoutine({ startTime: "09:00", duration: 60 })];
    expect(findNextAvailableTime(routines, 540, 30, [1, 2, 3, 4, 5])).toBe(
      "10:00",
    );
  });

  it("連続ルーティン後は最後の終了時刻を返す", () => {
    const routines = [
      createRoutine({ id: "1", startTime: "09:00", duration: 30 }),
      createRoutine({
        id: "2",
        startTime: "09:30",
        duration: 45,
        sortOrder: 1,
      }),
    ];

    expect(findNextAvailableTime(routines, 540, 30, [1, 2, 3, 4, 5])).toBe(
      "10:15",
    );
  });

  it("途中に空き時間がある場合は空き時間を優先する", () => {
    const routines = [
      createRoutine({ id: "1", startTime: "09:00", duration: 30 }),
      createRoutine({
        id: "2",
        startTime: "12:00",
        duration: 60,
        sortOrder: 1,
      }),
    ];

    expect(findNextAvailableTime(routines, 540, 30, [1, 2, 3, 4, 5])).toBe(
      "09:30",
    );
  });
});
