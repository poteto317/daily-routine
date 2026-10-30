import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TestMatrixStatusLegend } from "./TestMatrixStatusLegend";

const meta = {
  title: "Features/TestMatrix/TestMatrixStatusLegend",
  component: TestMatrixStatusLegend,
  parameters: { layout: "padded" },
} satisfies Meta<typeof TestMatrixStatusLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
