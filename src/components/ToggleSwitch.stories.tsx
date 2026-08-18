import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ToggleSwitch } from "./ToggleSwitch";

const meta = {
  title: "Components/ToggleSwitch",
  component: ToggleSwitch,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "ジャーナル",
    onToggle: fn(),
    className:
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-teal-500",
    thumbClassName:
      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6",
  },
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {
  args: {
    checked: true,
  },
};

export const Off: Story = {
  args: {
    checked: false,
    className:
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300",
    thumbClassName:
      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1",
  },
};

/** クリック → onToggle が呼ばれる */
export const ClickToggle: Story = {
  args: {
    checked: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("switch", { name: "ジャーナル" }));
    expect(args.onToggle).toHaveBeenCalledOnce();
  },
};
