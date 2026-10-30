import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { TestMatrixToolbar } from "./TestMatrixToolbar";

const meta = {
  title: "Features/TestMatrix/TestMatrixToolbar",
  component: TestMatrixToolbar,
  parameters: { layout: "padded" },
  args: {
    collapseAll: false,
    filterStatus: "all",
    onCollapseAll: fn(),
    onChangeFilter: fn(),
    onReset: fn(),
  },
} satisfies Meta<typeof TestMatrixToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
