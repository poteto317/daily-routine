import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FieldGroup } from "./FieldGroup";

const meta = {
  title: "Components/FieldGroup",
  component: FieldGroup,
  parameters: { layout: "padded" },
} satisfies Meta<typeof FieldGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const buttonClassName =
  "px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200";

/** 見出しは <label> ではなく、role=group から aria-labelledby で指す */
export const Days: Story = {
  args: {
    label: "曜日・祝日 *",
    groupClassName: "grid grid-cols-4 gap-2",
    children: ["日", "月", "火", "水", "木", "金", "土", "祝"].map((label) => (
      <button key={label} type="button" className={buttonClassName}>
        {label}
      </button>
    )),
  },
};

export const Categories: Story = {
  args: {
    label: "カテゴリ *",
    groupClassName: "grid grid-cols-3 gap-2",
    children: [
      "🎨 趣味",
      "🏠 生活",
      "💪 健康",
      "📚 勉強",
      "💼 仕事",
      "📌 その他",
    ].map((label) => (
      <button key={label} type="button" className={buttonClassName}>
        {label}
      </button>
    )),
  },
};
