import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { FeatureVisibilitySection } from "./FeatureVisibilitySection";
import type { VisibleFeaturesState } from "../state/featureVisibility";

const meta = {
  title: "Features/Settings/FeatureVisibilitySection",
  component: FeatureVisibilitySection,
  parameters: {
    layout: "padded",
  },
  args: {
    setVisibleFeatures: fn(),
  },
} satisfies Meta<typeof FeatureVisibilitySection>;

export default meta;
type Story = StoryObj<typeof meta>;

const allEnabled: VisibleFeaturesState = {
  journal: true,
  calendar: true,
  statistics: true,
  pomodoro: true,
  worktracker: true,
  weightTracker: true,
  meal: true,
  budget: true,
  weather: true,
  preset: true,
  todoLists: true,
  syncManagement: true,
  testMatrix: true,
  accountAdmin: true,
};

export const AllEnabled: Story = {
  args: { visibleFeatures: allEnabled },
};

export const AllDisabled: Story = {
  args: {
    visibleFeatures: Object.fromEntries(
      Object.keys(allEnabled).map((k) => [k, false]),
    ) as VisibleFeaturesState,
  },
};

export const Mixed: Story = {
  args: {
    visibleFeatures: {
      ...allEnabled,
      statistics: false,
      worktracker: false,
      testMatrix: false,
      accountAdmin: false,
    },
  },
};

export const ToggleJournal: Story = {
  args: { visibleFeatures: allEnabled },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggleButtons = canvas.getAllByRole("button");
    await userEvent.click(toggleButtons[0]);
    expect(args.setVisibleFeatures).toHaveBeenCalledOnce();
  },
};
