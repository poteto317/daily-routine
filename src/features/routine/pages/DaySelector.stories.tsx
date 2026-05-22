import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
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
