import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionCard } from "./SectionCard";

const meta = {
  title: "Features/Settings/SectionCard",
  component: SectionCard,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "通知設定",
    children: (
      <div className="text-sm text-gray-600">設定項目がここに入ります</div>
    ),
  },
};

export const WithBeta: Story = {
  args: {
    title: "電車遅延モニター",
    beta: true,
    children: (
      <div className="text-sm text-gray-600">
        ベータ機能の設定項目がここに入ります
      </div>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    title: "同期設定",
    description:
      "デバイス間でデータを同期します。変更はリアルタイムで反映されます。",
    children: (
      <div className="text-sm text-gray-600">設定項目がここに入ります</div>
    ),
  },
};

export const WithAll: Story = {
  args: {
    title: "AI アシスタント",
    beta: true,
    description: "AIを使ってルーティンの最適化提案を受け取ります。",
    children: (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" defaultChecked />
          提案を有効にする
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" />
          毎朝レポートを受け取る
        </label>
      </div>
    ),
  },
};

export const WithCustomClass: Story = {
  args: {
    title: "カスタムスタイル",
    className: "bg-gray-50 dark:bg-gray-800 p-4 rounded-xl",
    children: (
      <div className="text-sm text-gray-600">
        外部からクラスを追加した例です
      </div>
    ),
  },
};
