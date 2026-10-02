import { getStateColor, getPomodoroPrimaryButtonLabel } from "../helpers";
import { POMODORO_TIMER_PANEL_TEXT } from "../texts";

describe("pomodoro helpers", () => {
  describe("getStateColor", () => {
    it("focus状態では赤〜オレンジのグラデーションクラスを返す", () => {
      expect(getStateColor("focus")).toBe("from-red-500 to-orange-500");
    });

    it("break状態では緑〜ティールのグラデーションクラスを返す", () => {
      expect(getStateColor("break")).toBe("from-green-500 to-teal-500");
    });

    it("idle状態では青〜インディゴのグラデーションクラスを返す", () => {
      expect(getStateColor("idle")).toBe("from-blue-500 to-indigo-500");
    });
  });

  describe("getPomodoroPrimaryButtonLabel", () => {
    it("タイマー実行中の場合は一時停止ラベルを返す", () => {
      expect(getPomodoroPrimaryButtonLabel(true)).toBe(
        POMODORO_TIMER_PANEL_TEXT.pauseLabel,
      );
    });

    it("タイマー停止中の場合はスタートラベルを返す", () => {
      expect(getPomodoroPrimaryButtonLabel(false)).toBe(
        POMODORO_TIMER_PANEL_TEXT.startLabel,
      );
    });
  });
});
