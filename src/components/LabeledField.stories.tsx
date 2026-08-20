import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LabeledField } from "./LabeledField";

const meta = {
  title: "Components/LabeledField",
  component: LabeledField,
  parameters: { layout: "padded" },
} satisfies Meta<typeof LabeledField>;

export default meta;
type Story = StoryObj<typeof meta>;

const inputClassName =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500";

/** ラベルと入力欄が id で結ばれる。ラベルをクリックすると入力欄へフォーカスが移る */
export const Default: Story = {
  args: {
    label: "タイトル",
    children: (inputId: string) => (
      <input
        id={inputId}
        type="text"
        className={inputClassName}
        placeholder="例: 朝のストレッチ"
      />
    ),
  },
};

/** ラベルの右にバッジを置く。バッジの文字は入力欄の名前には含まれない */
export const WithAdornment: Story = {
  args: {
    label: "通知",
    labelAdornment: (
      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded">
        BETA
      </span>
    ),
    children: (inputId: string) => (
      <input
        id={inputId}
        type="number"
        className={inputClassName}
        placeholder="デフォルト: 通知なし"
      />
    ),
  },
};

/** 入力欄の下に補足を置く */
export const WithHint: Story = {
  args: {
    label: "所要時間",
    children: (inputId: string) => (
      <>
        <input id={inputId} type="number" className={inputClassName} />
        <p className="text-xs text-gray-500 mt-1">分単位で入力します</p>
      </>
    ),
  },
};
