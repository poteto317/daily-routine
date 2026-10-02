import * as pomodoroModule from "../index";

describe("pomodoro index exports", () => {
  it("必要なコンポーネントおよびストレージ関数がすべてエクスポートされている", () => {
    expect(pomodoroModule.PomodoroPage).toBeDefined();
    expect(pomodoroModule.getPomodoroHistory).toBeDefined();
    expect(pomodoroModule.savePomodoroHistory).toBeDefined();
    expect(pomodoroModule.getTodayPomodoros).toBeDefined();
    expect(pomodoroModule.incrementTodayPomodoros).toBeDefined();
  });
});
