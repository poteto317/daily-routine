import {
  getSchedules,
  clearSchedules,
  setSchedules,
  getCheckInterval,
  setCheckInterval,
} from "../notificationState";

describe("notificationState", () => {
  beforeEach(() => {
    clearSchedules();
    setCheckInterval(null);
  });

  it("スケジュールを設定・取得・クリアできる", () => {
    expect(getSchedules().size).toBe(0);

    const schedules = [
      { id: "s1", time: "09:00" },
      { id: "s2", time: "12:00" },
    ];
    setSchedules(schedules);

    expect(getSchedules().size).toBe(2);
    expect(getSchedules().get("s1")).toEqual({ id: "s1", time: "09:00" });

    clearSchedules();
    expect(getSchedules().size).toBe(0);
  });

  it("チェックインターバルを設定・取得できる", () => {
    expect(getCheckInterval()).toBeNull();

    const mockInterval = 12345;
    setCheckInterval(mockInterval);
    expect(getCheckInterval()).toBe(mockInterval);

    setCheckInterval(null);
    expect(getCheckInterval()).toBeNull();
  });
});
