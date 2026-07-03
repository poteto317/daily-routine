import {
  applyPomodoroCompletion,
  createResetTimerState,
  createSkipToBreakState,
  createStartTimerState,
} from "../pomodoroTimerActions";

jest.mock("../pomodoroCompletionTransition", () => ({
  getCompletionTransition: jest.fn(() => ({
    nextState: "break",
    nextTimeLeft: 300,
    shouldIncrementPomodoros: true,
  })),
}));
jest.mock("../pomodoroCompletionNotification", () => ({
  notifyTimerCompletion: jest.fn(),
}));
jest.mock("../pomodoroCompletionSound", () => ({
  playTimerCompletionSound: jest.fn(),
}));

import { getCompletionTransition } from "../pomodoroCompletionTransition";
import { notifyTimerCompletion } from "../pomodoroCompletionNotification";
import { playTimerCompletionSound } from "../pomodoroCompletionSound";

describe("pomodoroTimerActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reset state を生成する", () => {
    expect(createResetTimerState(25)).toEqual({
      nextIsRunning: false,
      nextTimerState: "idle",
      nextTimeLeft: 1500,
    });
  });

  it("skip to break state を生成する", () => {
    expect(createSkipToBreakState(5)).toEqual({
      nextIsRunning: false,
      nextTimerState: "break",
      nextTimeLeft: 300,
    });
  });

  it("idle から start で focus に遷移する", () => {
    expect(createStartTimerState("idle", 25, 123)).toEqual({
      nextIsRunning: true,
      nextTimerState: "focus",
      nextTimeLeft: 1500,
    });
  });

  it("idle 以外から start で残り時間を維持する", () => {
    expect(createStartTimerState("break", 25, 42)).toEqual({
      nextIsRunning: true,
      nextTimerState: "break",
      nextTimeLeft: 42,
    });
  });

  it("完了時に通知・遷移・完了数更新を実行する", () => {
    const setIsRunning = jest.fn();
    const setCompletedToday = jest.fn();
    const setTimerState = jest.fn();
    const setTimeLeft = jest.fn();
    const incrementTodayPomodoros = jest.fn();
    const getTodayPomodoros = jest.fn(() => 3);
    const audio = {} as HTMLAudioElement;

    applyPomodoroCompletion({
      timerState: "focus",
      focusMinutes: 25,
      breakMinutes: 5,
      audio,
      incrementTodayPomodoros,
      getTodayPomodoros,
      setIsRunning,
      setCompletedToday,
      setTimerState,
      setTimeLeft,
    });

    expect(playTimerCompletionSound).toHaveBeenCalledWith(audio);
    expect(notifyTimerCompletion).toHaveBeenCalledWith("focus");
    expect(getCompletionTransition).toHaveBeenCalledWith("focus", 25, 5);
    expect(incrementTodayPomodoros).toHaveBeenCalled();
    expect(setCompletedToday).toHaveBeenCalledWith(3);
    expect(setIsRunning).toHaveBeenCalledWith(false);
    expect(setTimerState).toHaveBeenCalledWith("break");
    expect(setTimeLeft).toHaveBeenCalledWith(300);
  });

  it("完了数を増やさない遷移も扱える", () => {
    (getCompletionTransition as jest.Mock).mockReturnValueOnce({
      nextState: "focus",
      nextTimeLeft: 1500,
      shouldIncrementPomodoros: false,
    });

    const setCompletedToday = jest.fn();
    const incrementTodayPomodoros = jest.fn();

    applyPomodoroCompletion({
      timerState: "break",
      focusMinutes: 25,
      breakMinutes: 5,
      audio: null,
      incrementTodayPomodoros,
      getTodayPomodoros: jest.fn(() => 2),
      setIsRunning: jest.fn(),
      setCompletedToday,
      setTimerState: jest.fn(),
      setTimeLeft: jest.fn(),
    });

    expect(incrementTodayPomodoros).not.toHaveBeenCalled();
    expect(setCompletedToday).not.toHaveBeenCalled();
  });
});
