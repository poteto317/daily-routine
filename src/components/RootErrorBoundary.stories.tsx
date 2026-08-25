import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RootErrorBoundary } from "./RootErrorBoundary";

const meta = {
  title: "Components/RootErrorBoundary",
  component: RootErrorBoundary,
  parameters: { layout: "padded" },
} satisfies Meta<typeof RootErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

const NormalChild = () => (
  <p className="text-gray-700 dark:text-gray-200">
    正常に描画されたコンテンツです。
  </p>
);

const ThrowingChild = () => {
  throw new Error("テスト用エラー");
};

export const Normal: Story = {
  args: { children: <NormalChild /> },
};

/** 子コンポーネントが例外をスローした場合のエラー UI */
export const ErrorState: Story = {
  args: { children: <ThrowingChild /> },
  parameters: {
    // Storybook のエラーオーバーレイを抑制して ErrorBoundary の UI を確認する
    chromatic: { disableSnapshot: false },
  },
};
