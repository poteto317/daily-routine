import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { HeaderMenuToggleButton } from "./HeaderMenuToggleButton";

type Props = React.ComponentProps<typeof HeaderMenuToggleButton>;

// menuButtonRef は Controls に露出させず render 側でのみ注入する
const HeaderMenuToggleButtonWithRef = (args: Omit<Props, "menuButtonRef">) => {
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  return <HeaderMenuToggleButton {...args} menuButtonRef={menuButtonRef} />;
};

const meta = {
  title: "Layouts/HeaderMenuToggleButton",
  component: HeaderMenuToggleButtonWithRef,
  parameters: { layout: "padded" },
  args: {
    onToggleClick: fn(),
    panelId: "header-menu-panel",
  },
} satisfies Meta<typeof HeaderMenuToggleButtonWithRef>;

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
