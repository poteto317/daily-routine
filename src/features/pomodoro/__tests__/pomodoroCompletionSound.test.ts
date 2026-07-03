import { playTimerCompletionSound } from "../pomodoroCompletionSound";

describe("playTimerCompletionSound", () => {
  it("audio が null の場合は何も起きない", () => {
    expect(() => playTimerCompletionSound(null)).not.toThrow();
  });

  it("audio.play() を呼び出す", () => {
    const play = jest.fn().mockResolvedValue(undefined);
    const audio = { play } as unknown as HTMLAudioElement;

    playTimerCompletionSound(audio);

    expect(play).toHaveBeenCalledTimes(1);
  });

  it("audio.play() が reject しても例外が伝播しない", async () => {
    const play = jest.fn().mockRejectedValue(new Error("play failed"));
    const audio = { play } as unknown as HTMLAudioElement;

    expect(() => playTimerCompletionSound(audio)).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();
  });
});
