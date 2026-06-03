import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatisticsPage } from "./StatisticsPage";

// StatisticsPage は useStatisticsPageState() を内部で呼び出す。
// localStorage からルーティン達成データを読み込む。
// データなしの場合はゼロ値でチャートが描画される。
// chartRegistration は StatisticsPage 自身が副作用 import しているため
// ここで追加の設定は不要。

const meta = {
  title: "Features/Statistics/StatisticsPage",
  component: StatisticsPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof StatisticsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ルーティンデータなし: ゼロ値でチャートが表示される */
export const Default: Story = {};
