import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AppearanceSection } from "./AppearanceSection";
import type { AppSettings } from "@/types/routine";

const meta = {
  title: "Features/Settings/AppearanceSection",
  component: AppearanceSection,
  parameters: {
    layout: "padded",
  },
  args: {
    setSettings: fn(),
    handleThemeChange: fn(),
  },
} satisfies Meta<typeof AppearanceSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseSettings: AppSettings = {
  theme: "auto",
  swipeAction: "delete",
  defaultDurationMinutes: 30,
  defaultNotificationMinutes: 5,
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
};

export const ThemeAuto: Story = {
  args: { settings: baseSettings },
};

export const ThemeLight: Story = {
  args: { settings: { ...baseSettings, theme: "light" } },
};

export const ThemeDark: Story = {
  args: { settings: { ...baseSettings, theme: "dark" } },
};

export const SwipeEdit: Story = {
  args: { settings: { ...baseSettings, swipeAction: "edit" } },
};

export const SelectDarkTheme: Story = {
  args: { settings: baseSettings },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const darkRadio = canvas.getByRole("radio", { name: /ダーク/ });
    await userEvent.click(darkRadio);
    expect(args.handleThemeChange).toHaveBeenCalledWith("dark");
  },
};
