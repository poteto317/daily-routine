import {
  getCurrentTime,
  getTodayString,
  isTimePassed,
  minutesToTime,
  timeToMinutes,
} from "../storage";

describe("storage time utilities", () => {
  it("getTodayStringはYYYY-MM-DD形式で返す", () => {
    expect(getTodayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("getCurrentTimeはHH:mm形式で返す", () => {
    expect(getCurrentTime()).toMatch(/^\d{2}:\d{2}$/);
  });

  it("timeToMinutes/minutesToTimeを相互変換できる", () => {
    expect(timeToMinutes("09:00")).toBe(540);
    expect(timeToMinutes("23:59")).toBe(1439);
    expect(minutesToTime(540)).toBe("09:00");
    expect(minutesToTime(1439)).toBe("23:59");
  });

  it("isTimePassedはminutesAfterを考慮して判定する", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T11:15:00"));

    expect(isTimePassed("11:00", 10)).toBe(true);
    expect(isTimePassed("11:00", 20)).toBe(false);

    jest.useRealTimers();
  });
});
