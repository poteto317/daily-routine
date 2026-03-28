import {
  createHandleTimerCompleteAction,
  createPauseTimerAction,
  createResetTimerAction,
  createSkipToBreakAction,
  createStartTimerAction,
} from "../pomodoroTimerHookActions";
import {
  createResetTimerState,
  createSkipToBreakState,
  createStartTimerState,
} from "../pomodoroTimerActions";
import { getTodayPomodoros, incrementTodayPomodoros } from "../storage";
import {
  applyPomodoroTimerControlState,
  createPausedPomodoroState,
  runPomodoroCompletion,
} from "../pomodoroViewStateActions";

jest.mock("../pomodoroTimerActions", () => ({
  createResetTimerState: jest.fn(() => ({
    nextIsRunning: false,
    nextTimerState: "idle",
    nextTimeLeft: 1500,
  })),
  createSkipToBreakState: jest.fn(() => ({
    nextIsRunning: false,
    nextTimerState: "break",
    nextTimeLeft: 300,
  })),
  createStartTimerState: jest.fn(() => ({
    nextIsRunning: true,
    nextTimerState: "focus",
    nextTimeLeft: 1200,
  })),
}));

jest.mock("../storage", () => ({
  getTodayPomodoros: jest.fn(() => 2),
  incrementTodayPomodoros: jest.fn(),
}));

jest.mock("../pomodoroViewStateActions", () => ({
  applyPomodoroTimerControlState: jest.fn(),
  createPausedPomodoroState: jest.fn(() => ({ isRunning: false })),
  runPomodoroCompletion: jest.fn(),
}));

describe("pomodoroTimerHookActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("completion handler が completion action と storage を束ねる", () => {
    const setIsRunning = jest.fn();
    const setCompletedToday = jest.fn();
    const setTimerState = jest.fn();
    const setTimeLeft = jest.fn();
    const audio = {} as HTMLAudioElement;

    createHandleTimerCompleteAction({
      timerState: "focus",
      focusMinutes: 25,
      breakMinutes: 5,
      audio,
      setIsRunning,
      setCompletedToday,
      setTimerState,
      setTimeLeft,
    })();

    expect(runPomodoroCompletion).toHaveBeenCalledWith({
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
  });

  it("pause action が pause state を setter へ反映する", () => {
    const setIsRunning = jest.fn();

    createPauseTimerAction({ setIsRunning })();

    expect(createPausedPomodoroState).toHaveBeenCalled();
    expect(setIsRunning).toHaveBeenCalledWith(false);
  });

  it("reset action が control state を適用する", () => {
    const setIsRunning = jest.fn();
    const setTimerState = jest.fn();
    const setTimeLeft = jest.fn();

    createResetTimerAction({
      focusMinutes: 25,
      setIsRunning,
      setTimerState,
      setTimeLeft,
    })();

    expect(createResetTimerState).toHaveBeenCalledWith(25);
    expect(applyPomodoroTimerControlState).toHaveBeenCalledWith({
      nextState: {
        nextIsRunning: false,
        nextTimerState: "idle",
        nextTimeLeft: 1500,
      },
      setIsRunning,
      setTimerState,
      setTimeLeft,
    });
  });

  it("skip action が break state を適用する", () => {
    const setIsRunning = jest.fn();
    const setTimerState = jest.fn();
    const setTimeLeft = jest.fn();

    createSkipToBreakAction({
      breakMinutes: 5,
      setIsRunning,
      setTimerState,
      setTimeLeft,
    })();

    expect(createSkipToBreakState).toHaveBeenCalledWith(5);
    expect(applyPomodoroTimerControlState).toHaveBeenCalledWith({
      nextState: {
        nextIsRunning: false,
        nextTimerState: "break",
        nextTimeLeft: 300,
      },
      setIsRunning,
      setTimerState,
      setTimeLeft,
    });
  });

  it("start action が現在 state から開始状態を適用する", () => {
    const setIsRunning = jest.fn();
    const setTimerState = jest.fn();
    const setTimeLeft = jest.fn();

    createStartTimerAction({
      timerState: "idle",
      focusMinutes: 25,
      timeLeft: 1500,
      setIsRunning,
      setTimerState,
      setTimeLeft,
    })();

    expect(createStartTimerState).toHaveBeenCalledWith("idle", 25, 1500);
    expect(applyPomodoroTimerControlState).toHaveBeenCalledWith({
      nextState: {
        nextIsRunning: true,
        nextTimerState: "focus",
        nextTimeLeft: 1200,
      },
      setIsRunning,
      setTimerState,
      setTimeLeft,
    });
  });
});
