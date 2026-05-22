import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingState } from "./LoadingState";

const meta = {
  title: "Features/Weather/LoadingState",
  component: LoadingState,
  parameters: { layout: "padded" },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { locationStatus: "現在地を取得中..." },
};

export const WithLocation: Story = {
  args: { locationStatus: "東京都の天気を取得中..." },
};
