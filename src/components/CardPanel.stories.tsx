import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardPanel } from "./CardPanel";

const meta = {
  title: "Components/CardPanel",
  component: CardPanel,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CardPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p className="text-gray-700">カードの内容がここに入ります。</p>,
  },
};

export const WithCustomClass: Story = {
  args: {
    children: <p className="text-gray-700">カスタムクラス適用済み</p>,
    className: "border-2 border-teal-400",
  },
};

export const WithRichContent: Story = {
  args: {
    children: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">タイトル</h2>
        <p className="text-gray-600 text-sm">
          CardPanel は白背景・角丸・影付きの共通カードコンテナです。
        </p>
        <button className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm">
          アクション
        </button>
      </div>
    ),
  },
};
