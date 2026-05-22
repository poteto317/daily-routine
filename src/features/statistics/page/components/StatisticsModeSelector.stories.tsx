import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { StatisticsModeSelector } from "./StatisticsModeSelector";

const meta = {
  title: "Features/Statistics/StatisticsModeSelector",
  component: StatisticsModeSelector,
  parameters: {
    layout: "padded",
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof StatisticsModeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeekMode: Story = {
  args: { viewMode: "week" },
};

export const MonthMode: Story = {
  args: { viewMode: "month" },
};

export const CategoryMode: Story = {
  args: { viewMode: "category" },
};

export const SwitchToMonth: Story = {
  args: { viewMode: "week" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    const monthButton = buttons.find((btn) =>
      btn.textContent?.includes("月"),
    )!;
    await userEvent.click(monthButton);
    expect(args.onChange).toHaveBeenCalledWith("month");
  },
};
