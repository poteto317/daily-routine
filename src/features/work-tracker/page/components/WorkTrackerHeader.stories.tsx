import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkTrackerHeader } from "./WorkTrackerHeader";

const meta = {
  title: "Features/WorkTracker/WorkTrackerHeader",
  component: WorkTrackerHeader,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof WorkTrackerHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
