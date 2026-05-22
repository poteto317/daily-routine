import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FullScreenLoading } from "./FullScreenLoading";

const meta = {
  title: "Components/FullScreenLoading",
  component: FullScreenLoading,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FullScreenLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { message: "読み込み中..." },
};

export const AuthLoading: Story = {
  args: { message: "認証情報を確認中..." },
};

export const DataLoading: Story = {
  args: { message: "データを同期中..." },
};
