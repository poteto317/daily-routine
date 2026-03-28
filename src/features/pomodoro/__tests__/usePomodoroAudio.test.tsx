import { renderHook } from "@testing-library/react";

jest.mock("../pomodoroTimerRuntime", () => ({
  createPomodoroAudio: jest.fn(() => ({ play: jest.fn() })),
  resolveTimerTick: jest.fn(),
  shouldStartPomodoroInterval: jest.fn(),
}));

import { createPomodoroAudio } from "../pomodoroTimerRuntime";
import { usePomodoroAudio } from "../usePomodoroAudio";

describe("usePomodoroAudio", () => {
  it("mount 時に audio を 1 回だけ作成する", () => {
    const { result } = renderHook(() => usePomodoroAudio());

    expect(createPomodoroAudio).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ play: expect.any(Function) });
  });
});
