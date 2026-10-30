import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { PeriodNavButton } from "./PeriodNavButton";

const meta = {
  title: "Components/PeriodNavButton",
  component: PeriodNavButton,
  parameters: {
    layout: "centered",
  },
  args: {
    direction: "previous",
    onClick: fn(),
    ariaLabel: "前へ",
    type: "button",
  },
} satisfies Meta<typeof PeriodNavButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
