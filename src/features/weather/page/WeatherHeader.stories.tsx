import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { WeatherHeader } from "./WeatherHeader";

const meta = {
  title: "Features/Weather/WeatherHeader",
  component: WeatherHeader,
  parameters: { layout: "padded" },
  args: {
    onUseCurrentLocation: fn(),
    onResetPreferredLocation: fn(),
  },
} satisfies Meta<typeof WeatherHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    location: "東京都千代田区",
    isLocationLoading: false,
    hasPreferredLocation: false,
  },
};

export const WithPreferredLocation: Story = {
  args: {
    location: "大阪府大阪市",
    isLocationLoading: false,
    hasPreferredLocation: true,
  },
};

export const Loading: Story = {
  args: {
    location: "取得中...",
    isLocationLoading: true,
    hasPreferredLocation: false,
  },
};
