import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CalendarMonthNavigation } from "./CalendarMonthNavigation";

const meta = {
  title: "Features/Calendar/CalendarMonthNavigation",
  component: CalendarMonthNavigation,
  parameters: {
    layout: "padded",
  },
  args: {
    onGoToToday: fn(),
    onNextMonth: fn(),
    onPreviousMonth: fn(),
  },
} satisfies Meta<typeof CalendarMonthNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentMonth: Story = {
  args: { year: 2026, month: 5 },
};

export const January: Story = {
  args: { year: 2026, month: 1 },
};

export const December: Story = {
  args: { year: 2025, month: 12 },
};

export const ClickPrevious: Story = {
  args: { year: 2026, month: 5 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await userEvent.click(buttons[0]);
    expect(args.onPreviousMonth).toHaveBeenCalledOnce();
  },
};

export const ClickNext: Story = {
  args: { year: 2026, month: 5 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await userEvent.click(buttons[buttons.length - 1]);
    expect(args.onNextMonth).toHaveBeenCalledOnce();
  },
};

export const ClickToday: Story = {
  args: { year: 2026, month: 3 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const todayButton = canvas.getByRole("button", { name: /今日/ });
    await userEvent.click(todayButton);
    expect(args.onGoToToday).toHaveBeenCalledOnce();
  },
};
