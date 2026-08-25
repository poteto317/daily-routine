import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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

/** 「現在地を使用」ボタンをクリック → onUseCurrentLocation が呼ばれる */
export const ClickUseCurrentLocation: Story = {
  args: {
    location: "東京都千代田区",
    isLocationLoading: false,
    hasPreferredLocation: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const locationButton = canvas.getByRole("button", { name: "現在地を使用" });
    await userEvent.click(locationButton);
    expect(args.onUseCurrentLocation).toHaveBeenCalledOnce();
  },
};

/** 「現在地をリセット」ボタンをクリック → onResetPreferredLocation が呼ばれる */
export const ClickResetLocation: Story = {
  args: {
    location: "大阪府大阪市",
    isLocationLoading: false,
    hasPreferredLocation: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const resetButton = canvas.getByRole("button", {
      name: "現在地をリセット",
    });
    await userEvent.click(resetButton);
    expect(args.onResetPreferredLocation).toHaveBeenCalledOnce();
  },
};
