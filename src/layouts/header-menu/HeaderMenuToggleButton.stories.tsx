import { useRef } from "react";
import type { RefObject } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { HeaderMenuToggleButton } from "./HeaderMenuToggleButton";

const meta = {
  title: "Layouts/HeaderMenuToggleButton",
  component: HeaderMenuToggleButton,
  parameters: { layout: "padded" },
  args: {
    onToggleClick: fn(),
    panelId: "header-menu-panel",
    menuButtonRef: { current: null } as RefObject<HTMLButtonElement | null>,
  },
  render: (args) => {
    const menuButtonRef = useRef<HTMLButtonElement | null>(null);
    return <HeaderMenuToggleButton {...args} menuButtonRef={menuButtonRef} />;
  },
} satisfies Meta<typeof HeaderMenuToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: { isMenuOpen: false },
};

export const Open: Story = {
  args: { isMenuOpen: true },
};

export const ClickToOpen: Story = {
  args: { isMenuOpen: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    expect(args.onToggleClick).toHaveBeenCalledOnce();
  },
};
