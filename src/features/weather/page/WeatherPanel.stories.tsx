import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WeatherPanel } from "./WeatherPanel";

const meta = {
  title: "Features/Weather/WeatherPanel",
  component: WeatherPanel,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WeatherPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <p className="text-gray-700">天気パネルのコンテンツがここに表示されます。</p> },
};
