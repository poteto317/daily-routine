import { render, screen, fireEvent } from "@testing-library/react";
import { PomodoroTimerPanel } from "../components/PomodoroTimerPanel";
import { POMODORO_DISPLAY_TEXT, POMODORO_TIMER_PANEL_TEXT } from "../texts";

describe("PomodoroTimerPanel", () => {
  const defaultProps = {
    isRunning: false,
    progressPercentage: 40,
    showSkipToBreak: false,
    timerState: "focus" as const,
    timeLeft: 900,
    onPause: jest.fn(),
    onReset: jest.fn(),
    onSkipToBreak: jest.fn(),
    onStart: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("タイマー表示とプログレスバーを正しくレンダリングする", () => {
    const { container } = render(<PomodoroTimerPanel {...defaultProps} />);

    expect(
      screen.getByText(POMODORO_DISPLAY_TEXT.focusStateText),
    ).toBeInTheDocument();
    expect(screen.getByText("15:00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: POMODORO_TIMER_PANEL_TEXT.startLabel }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: POMODORO_TIMER_PANEL_TEXT.resetLabel }),
    ).toBeInTheDocument();

    const progressBar = container.querySelector(
      'div[style*="width: 40%"]',
    );
    expect(progressBar).toBeInTheDocument();
  });

  it("タイマー停止中にスタートボタンをクリックするとonStartが呼ばれる", () => {
    render(<PomodoroTimerPanel {...defaultProps} isRunning={false} />);

    fireEvent.click(
      screen.getByRole("button", { name: POMODORO_TIMER_PANEL_TEXT.startLabel }),
    );
    expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPause).not.toHaveBeenCalled();
  });

  it("タイマー実行中に一時停止ボタンをクリックするとonPauseが呼ばれる", () => {
    render(<PomodoroTimerPanel {...defaultProps} isRunning={true} />);

    fireEvent.click(
      screen.getByRole("button", { name: POMODORO_TIMER_PANEL_TEXT.pauseLabel }),
    );
    expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
    expect(defaultProps.onStart).not.toHaveBeenCalled();
  });

  it("リセットボタンをクリックするとonResetが呼ばれる", () => {
    render(<PomodoroTimerPanel {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: POMODORO_TIMER_PANEL_TEXT.resetLabel }),
    );
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });

  it("showSkipToBreakがtrueの場合、スキップボタンが表示されクリックするとonSkipToBreakが呼ばれる", () => {
    render(
      <PomodoroTimerPanel
        {...defaultProps}
        showSkipToBreak={true}
      />,
    );

    const skipButton = screen.getByRole("button", {
      name: POMODORO_TIMER_PANEL_TEXT.skipBreakLabel,
    });
    expect(skipButton).toBeInTheDocument();

    fireEvent.click(skipButton);
    expect(defaultProps.onSkipToBreak).toHaveBeenCalledTimes(1);
  });

  it("showSkipToBreakがfalseの場合、スキップボタンは表示されない", () => {
    render(
      <PomodoroTimerPanel
        {...defaultProps}
        showSkipToBreak={false}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: POMODORO_TIMER_PANEL_TEXT.skipBreakLabel,
      }),
    ).not.toBeInTheDocument();
  });
});
