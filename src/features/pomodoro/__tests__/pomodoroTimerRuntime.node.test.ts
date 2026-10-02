/**
 * @jest-environment node
 */
import { createPomodoroAudio } from "../pomodoroTimerRuntime";

describe("pomodoroTimerRuntime in node environment", () => {
  it("window が存在しない環境では null を返す", () => {
    expect(typeof window).toBe("undefined");
    const audio = createPomodoroAudio();
    expect(audio).toBeNull();
  });
});
