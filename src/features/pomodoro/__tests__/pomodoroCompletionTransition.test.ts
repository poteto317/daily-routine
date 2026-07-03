import { getCompletionTransition } from "../pomodoroCompletionTransition";

describe("getCompletionTransition", () => {
  it("focus から break へ遷移し、ポモドーロ数を加算する", () => {
    expect(getCompletionTransition("focus", 25, 5)).toEqual({
      nextState: "break",
      nextTimeLeft: 300,
      shouldIncrementPomodoros: true,
    });
  });

  it("break から focus へ遷移し、ポモドーロ数を加算しない", () => {
    expect(getCompletionTransition("break", 25, 5)).toEqual({
      nextState: "focus",
      nextTimeLeft: 1500,
      shouldIncrementPomodoros: false,
    });
  });

  it("idle の場合は focus へ遷移し、ポモドーロ数を加算しない", () => {
    expect(getCompletionTransition("idle", 25, 5)).toEqual({
      nextState: "focus",
      nextTimeLeft: 1500,
      shouldIncrementPomodoros: false,
    });
  });
});
