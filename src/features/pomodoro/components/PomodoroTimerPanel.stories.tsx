import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PomodoroTimerPanel } from "./PomodoroTimerPanel";

const meta = {
  title: "Features/Pomodoro/PomodoroTimerPanel",
  component: PomodoroTimerPanel,
  parameters: {
    layout: "padded",
  },
  args: {
    onPause: fn(),
    onReset: fn(),
    onSkipToBreak: fn(),
    onStart: fn(),
  },
} satisfies Meta<typeof PomodoroTimerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FocusIdle: Story = {
  args: {
    timerState: "focus",
    isRunning: false,
    timeLeft: 25 * 60,
    progressPercentage: 0,
    showSkipToBreak: false,
  },
};

export const FocusRunning: Story = {
  args: {
    timerState: "focus",
    isRunning: true,
    timeLeft: 18 * 60 + 30,
    progressPercentage: 26,
    showSkipToBreak: false,
  },
};

export const FocusNearEnd: Story = {
  args: {
    timerState: "focus",
    isRunning: true,
    timeLeft: 90,
    progressPercentage: 94,
    showSkipToBreak: true,
  },
};

export const BreakIdle: Story = {
  args: {
    timerState: "break",
    isRunning: false,
    timeLeft: 5 * 60,
    progressPercentage: 0,
    showSkipToBreak: false,
  },
};

export const BreakRunning: Story = {
  args: {
    timerState: "break",
    isRunning: true,
    timeLeft: 3 * 60 + 15,
    progressPercentage: 35,
    showSkipToBreak: false,
  },
};

export const ClickStart: Story = {
  args: {
    timerState: "focus",
    isRunning: false,
    timeLeft: 25 * 60,
    progressPercentage: 0,
    showSkipToBreak: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const startButton = canvas.getByRole("button", { name: /開始|スタート/ });
    await userEvent.click(startButton);
    expect(args.onStart).toHaveBeenCalledOnce();
  },
};

export const ClickPause: Story = {
  args: {
    timerState: "focus",
    isRunning: true,
    timeLeft: 20 * 60,
    progressPercentage: 20,
    showSkipToBreak: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const pauseButton = canvas.getByRole("button", {
      name: /一時停止|ポーズ|停止/,
    });
    await userEvent.click(pauseButton);
    expect(args.onPause).toHaveBeenCalledOnce();
  },
};
