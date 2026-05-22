import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccountAdminLegend } from "./AccountAdminLegend";

const meta = {
  title: "Features/AccountAdmin/AccountAdminLegend",
  component: AccountAdminLegend,
  parameters: { layout: "padded" },
} satisfies Meta<typeof AccountAdminLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
