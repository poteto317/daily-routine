import { samplePomodoroHistory } from "../__fixtures__/pomodoroFixtures";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

describe("samplePomodoroHistory", () => {
  it("2件のエントリを含む", () => {
    expect(Object.keys(samplePomodoroHistory)).toHaveLength(2);
  });

  it("キーが YYYY-MM-DD 形式である", () => {
    Object.keys(samplePomodoroHistory).forEach((key) => {
      expect(key).toMatch(DATE_KEY_PATTERN);
    });
  });

  it("各 value の date がキーと一致する", () => {
    Object.entries(samplePomodoroHistory).forEach(([key, session]) => {
      expect(session.date).toBe(key);
    });
  });

  it("completedPomodoros が正の整数である", () => {
    Object.values(samplePomodoroHistory).forEach((session) => {
      expect(session.completedPomodoros).toBeGreaterThan(0);
      expect(Number.isInteger(session.completedPomodoros)).toBe(true);
    });
  });

  it("各エントリが date と completedPomodoros プロパティを持つ", () => {
    Object.values(samplePomodoroHistory).forEach((session) => {
      expect(session).toHaveProperty("date");
      expect(session).toHaveProperty("completedPomodoros");
    });
  });
});
