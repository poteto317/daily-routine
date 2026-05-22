import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetMonthNavigation } from "./BudgetMonthNavigation";

const meta = {
  title: "Features/Budget/BudgetMonthNavigation",
  component: BudgetMonthNavigation,
  parameters: {
    layout: "padded",
  },
  args: {
    onGoToCurrentMonth: fn(),
    onNextMonth: fn(),
    onPreviousMonth: fn(),
  },
} satisfies Meta<typeof BudgetMonthNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentMonth: Story = {
  args: { currentDate: new Date("2026-05-01"), isCurrentMonth: true },
};

export const PastMonth: Story = {
  args: { currentDate: new Date("2026-03-01"), isCurrentMonth: false },
};

export const FutureMonth: Story = {
  args: { currentDate: new Date("2026-07-01"), isCurrentMonth: false },
};

export const ClickPrevious: Story = {
  args: { currentDate: new Date("2026-05-01"), isCurrentMonth: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const prevButton = canvas.getAllByRole("button")[0];
    await userEvent.click(prevButton);
    expect(args.onPreviousMonth).toHaveBeenCalledOnce();
  },
};

export const ClickGoToCurrent: Story = {
  args: { currentDate: new Date("2026-03-01"), isCurrentMonth: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const todayButton = canvas.getByRole("button", { name: /今月|今|current/i });
    await userEvent.click(todayButton);
    expect(args.onGoToCurrentMonth).toHaveBeenCalledOnce();
  },
};
