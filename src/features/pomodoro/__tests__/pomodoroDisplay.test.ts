import {
  getProgressPercentage,
  getStateText,
  formatPomodoroTimer,
} from "../pomodoroDisplay";
import { POMODORO_DISPLAY_TEXT } from "../texts";

describe("pomodoroDisplay", () => {
  describe("getProgressPercentage", () => {
    it("focus状態の進捗率を正しく計算する", () => {
      // 25分中12.5分（750秒）経過 -> 50%
      const percentage = getProgressPercentage("focus", 750, 25, 5);
      expect(percentage).toBe(50);
    });

    it("break状態の進捗率を正しく計算する", () => {
      // 5分（300秒）中0秒残り -> 100%
      const percentage = getProgressPercentage("break", 0, 25, 5);
      expect(percentage).toBe(100);
    });

    it("idle状態の進捗率を正しく計算する（focusMinutes基準）", () => {
      // 25分（1500秒）中1500秒残り -> 0%
      const percentage = getProgressPercentage("idle", 1500, 25, 5);
      expect(percentage).toBe(0);
    });
  });

  describe("getStateText", () => {
    it("focus状態のテキストを返す", () => {
      expect(getStateText("focus")).toBe(POMODORO_DISPLAY_TEXT.focusStateText);
    });

    it("break状態のテキストを返す", () => {
      expect(getStateText("break")).toBe(POMODORO_DISPLAY_TEXT.breakStateText);
    });

    it("idle状態のテキストを返す", () => {
      expect(getStateText("idle")).toBe(POMODORO_DISPLAY_TEXT.idleStateText);
    });
  });

  describe("formatPomodoroTimer", () => {
    it("秒数をmm:ss形式でゼロ埋めフォーマットする", () => {
      expect(formatPomodoroTimer(0)).toBe("00:00");
      expect(formatPomodoroTimer(9)).toBe("00:09");
      expect(formatPomodoroTimer(65)).toBe("01:05");
      expect(formatPomodoroTimer(1500)).toBe("25:00");
    });
  });
});
