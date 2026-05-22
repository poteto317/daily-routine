import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WeatherFooter } from "./WeatherFooter";

const meta = {
  title: "Features/Weather/WeatherFooter",
  component: WeatherFooter,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WeatherFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { lastUpdated: "2026-05-22T10:00:00" },
};
