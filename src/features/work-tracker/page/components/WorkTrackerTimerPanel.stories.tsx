import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkTrackerTimerPanel } from "./WorkTrackerTimerPanel";

const meta = {
  title: "Features/WorkTracker/WorkTrackerTimerPanel",
  component: WorkTrackerTimerPanel,
  parameters: {
    layout: "padded",
  },
  args: {
    onStart: fn(),
    onStop: fn(),
  },
} satisfies Meta<typeof WorkTrackerTimerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { isRunning: false, elapsedTime: 0, showInputForm: false },
};

export const Running: Story = {
  args: { isRunning: true, elapsedTime: 3723, showInputForm: false },
};

export const LongSession: Story = {
  args: { isRunning: true, elapsedTime: 14400, showInputForm: false },
};

export const StartDisabledWhileForm: Story = {
  args: { isRunning: false, elapsedTime: 0, showInputForm: true },
};

export const ClickStart: Story = {
  args: { isRunning: false, elapsedTime: 0, showInputForm: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const startButton = canvas.getByRole("button", { name: /開始|スタート/ });
    await userEvent.click(startButton);
    expect(args.onStart).toHaveBeenCalledOnce();
  },
};

export const ClickStop: Story = {
  args: { isRunning: true, elapsedTime: 1800, showInputForm: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const stopButton = canvas.getByRole("button", { name: /停止|ストップ/ });
    await userEvent.click(stopButton);
    expect(args.onStop).toHaveBeenCalledOnce();
  },
};
