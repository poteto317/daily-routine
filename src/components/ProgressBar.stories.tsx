import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ProgressBar from "./ProgressBar";

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotStarted: Story = {
  args: {
    completedMinutes: 0,
    totalMinutes: 120,
    progressPercentage: 0,
  },
};

export const HalfDone: Story = {
  args: {
    completedMinutes: 60,
    totalMinutes: 120,
    progressPercentage: 50,
  },
};

export const AlmostDone: Story = {
  args: {
    completedMinutes: 108,
    totalMinutes: 120,
    progressPercentage: 90,
  },
};

export const Completed: Story = {
  args: {
    completedMinutes: 120,
    totalMinutes: 120,
    progressPercentage: 100,
  },
};

export const ShortRoutine: Story = {
  args: {
    completedMinutes: 5,
    totalMinutes: 15,
    progressPercentage: 33,
  },
};
