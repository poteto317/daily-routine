import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TestMatrixSummaryBar } from "./TestMatrixSummaryBar";

const meta = {
  title: "Features/TestMatrix/TestMatrixSummaryBar",
  component: TestMatrixSummaryBar,
  parameters: { layout: "padded" },
  args: {
    totalCount: 10,
    okCount: 4,
    ngCount: 1,
    uncheckedCount: 5,
    progressPct: 40,
  },
} satisfies Meta<typeof TestMatrixSummaryBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
