import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WeatherPage } from "./WeatherPage";

// WeatherPage は useWeatherPageState() を内部で呼び出す。
// Storybook 環境では外部 API への接続がないため、ローディング状態が表示される。
// 各 UI 状態（ローディング・エラー・データ表示）の個別確認は
// LoadingState / ErrorState / WeatherDataView の各ストーリーを参照。

const meta = {
  title: "Features/Weather/WeatherPage",
  component: WeatherPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WeatherPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
