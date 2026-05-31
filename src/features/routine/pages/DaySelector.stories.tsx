import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DaySelector, DAYS } from "./DaySelector";

const meta = {
  title: "Features/Routine/DaySelector",
  component: DaySelector,
  parameters: { layout: "padded" },
  args: { onViewModeChangeAction: fn() },
} satisfies Meta<typeof DaySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const allDaysAndHoliday = [...DAYS, "holiday" as const];

export const Monday: Story = {
  args: { viewMode: 1, sortedDaysAndHoliday: allDaysAndHoliday },
};

export const Friday: Story = {
  args: { viewMode: 5, sortedDaysAndHoliday: allDaysAndHoliday },
};

export const Holiday: Story = {
  args: { viewMode: "holiday", sortedDaysAndHoliday: allDaysAndHoliday },
};

export const WeekdaysOnly: Story = {
  args: {
    viewMode: 1,
    sortedDaysAndHoliday: DAYS.filter((d) => d.value >= 1 && d.value <= 5),
  },
};

/** 金曜日をクリック → onViewModeChangeAction(5) が呼ばれる */
export const ClickFriday: Story = {
  args: { viewMode: 1, sortedDaysAndHoliday: allDaysAndHoliday },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const fridayButton = canvas.getByRole("button", { name: "金曜日" });
    await userEvent.click(fridayButton);
    expect(args.onViewModeChangeAction).toHaveBeenCalledWith(5);
  },
};

/** 祝日をクリック → onViewModeChangeAction("holiday") が呼ばれる */
export const ClickHoliday: Story = {
  args: { viewMode: 1, sortedDaysAndHoliday: allDaysAndHoliday },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const holidayButton = canvas.getByRole("button", { name: /祝日/ });
    await userEvent.click(holidayButton);
    expect(args.onViewModeChangeAction).toHaveBeenCalledWith("holiday");
  },
};
