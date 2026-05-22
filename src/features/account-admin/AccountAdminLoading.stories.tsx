import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccountAdminLoading } from "./AccountAdminLoading";

const meta = {
  title: "Features/AccountAdmin/AccountAdminLoading",
  component: AccountAdminLoading,
  parameters: { layout: "padded" },
} satisfies Meta<typeof AccountAdminLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
