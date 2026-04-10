import {
  createPomodoroAudio,
  resolveTimerTick,
  shouldStartPomodoroInterval,
} from "../pomodoroTimerRuntime";

describe("pomodoroTimerRuntime", () => {
  const originalAudio = global.Audio;

  beforeEach(() => {
    jest.clearAllMocks();
    global.Audio = jest.fn(() => ({
      play: jest.fn(),
    })) as unknown as typeof Audio;
  });

  afterEach(() => {
    global.Audio = originalAudio;
  });

  it("window 環境で audio を生成する", () => {
    const audio = createPomodoroAudio();

    expect(global.Audio).toHaveBeenCalled();
    expect(audio).not.toBeNull();
  });

  it("interval 開始条件を判定する", () => {
    expect(shouldStartPomodoroInterval(true, 10)).toBe(true);
    expect(shouldStartPomodoroInterval(false, 10)).toBe(false);
    expect(shouldStartPomodoroInterval(true, 0)).toBe(false);
  });

  it("残り時間の tick 結果を返す", () => {
    expect(resolveTimerTick(5)).toEqual({
      nextTimeLeft: 4,
      shouldComplete: false,
    });
    expect(resolveTimerTick(1)).toEqual({
      nextTimeLeft: 0,
      shouldComplete: true,
    });
  });
});
