import { render, screen } from "@testing-library/react";
import { PomodoroPage } from "../PomodoroPage";
import { POMODORO_PAGE_TEXT } from "../texts";
import { usePomodoroTimer } from "../usePomodoroTimer";

jest.mock("../usePomodoroTimer");

const mockUsePomodoroTimer = usePomodoroTimer as jest.MockedFunction<
  typeof usePomodoroTimer
>;

describe("PomodoroPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePomodoroTimer.mockReturnValue({
      isRunning: false,
      timeLeft: 1500,
      timerState: "idle",
      completedToday: 3,
      focusMinutes: 25,
      breakMinutes: 5,
      showSkipToBreak: false,
      startTimer: jest.fn(),
      pauseTimer: jest.fn(),
      resetTimer: jest.fn(),
      skipToBreak: jest.fn(),
    });
  });

  it("タイトル、ベータラベル、今日の完了数、設定時間をレンダリングする", () => {
    render(<PomodoroPage />);

    expect(screen.getByText(POMODORO_PAGE_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(POMODORO_PAGE_TEXT.betaLabel)).toBeInTheDocument();
    expect(
      screen.getByText(POMODORO_PAGE_TEXT.todayCompletedLabel),
    ).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(
      screen.getByText(POMODORO_PAGE_TEXT.focusTimeLabel),
    ).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(
      screen.getByText(POMODORO_PAGE_TEXT.breakTimeLabel),
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(POMODORO_PAGE_TEXT.hint)).toBeInTheDocument();
  });
});
