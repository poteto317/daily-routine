import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkTrackerMoodSelector } from "./WorkTrackerMoodSelector";

const meta = {
  title: "Features/WorkTracker/WorkTrackerMoodSelector",
  component: WorkTrackerMoodSelector,
  parameters: {
    layout: "padded",
  },
  args: {
    setSelectedMood: fn(),
  },
} satisfies Meta<typeof WorkTrackerMoodSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Great: Story = {
  args: { selectedMood: "great" },
};

export const Good: Story = {
  args: { selectedMood: "good" },
};

export const Normal: Story = {
  args: { selectedMood: "normal" },
};

export const Tired: Story = {
  args: { selectedMood: "tired" },
};

export const Stressed: Story = {
  args: { selectedMood: "stressed" },
};

export const SelectMood: Story = {
  args: { selectedMood: "normal" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tiredButton = canvas.getByRole("button", { name: /疲れた/ });
    await userEvent.click(tiredButton);
    expect(args.setSelectedMood).toHaveBeenCalledWith("tired");
  },
};
