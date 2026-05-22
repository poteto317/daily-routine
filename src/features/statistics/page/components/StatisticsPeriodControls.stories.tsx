import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { StatisticsPeriodControls } from "./StatisticsPeriodControls";

const meta = {
  title: "Features/Statistics/StatisticsPeriodControls",
  component: StatisticsPeriodControls,
  parameters: {
    layout: "padded",
  },
  args: {
    onPrevious: fn(),
    onNext: fn(),
    onToday: fn(),
  },
} satisfies Meta<typeof StatisticsPeriodControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeekMode: Story = {
  args: { viewMode: "week", periodLabel: "2026年5月18日〜24日" },
};

export const MonthMode: Story = {
  args: { viewMode: "month", periodLabel: "2026年5月" },
};

export const CategoryMode: Story = {
  args: { viewMode: "category", periodLabel: "2026年5月" },
};

export const ClickPrevious: Story = {
  args: { viewMode: "week", periodLabel: "2026年5月18日〜24日" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await userEvent.click(buttons[0]);
    expect(args.onPrevious).toHaveBeenCalledOnce();
  },
};

export const ClickNext: Story = {
  args: { viewMode: "week", periodLabel: "2026年5月18日〜24日" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await userEvent.click(buttons[buttons.length - 1]);
    expect(args.onNext).toHaveBeenCalledOnce();
  },
};
