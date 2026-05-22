import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarWeekHeader } from "./CalendarWeekHeader";

const meta = {
  title: "Features/Calendar/CalendarWeekHeader",
  component: CalendarWeekHeader,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CalendarWeekHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
