import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarLegend } from "./CalendarLegend";

const meta = {
  title: "Features/Calendar/CalendarLegend",
  component: CalendarLegend,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CalendarLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
