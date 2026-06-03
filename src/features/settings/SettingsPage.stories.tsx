import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SettingsPage } from "./SettingsPage";

// SettingsPage は useSettingsPageState() を内部で呼び出す。
// localStorage からアプリ設定を読み込む（デフォルト値あり）。
// データなしでもデフォルト設定でそのまま表示される。

const meta = {
  title: "Features/Settings/SettingsPage",
  component: SettingsPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** デフォルト設定: localStorage が空の場合 */
export const Default: Story = {};
