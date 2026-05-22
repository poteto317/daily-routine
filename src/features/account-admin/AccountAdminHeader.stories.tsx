import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccountAdminHeader } from "./AccountAdminHeader";

const meta = {
  title: "Features/AccountAdmin/AccountAdminHeader",
  component: AccountAdminHeader,
  parameters: { layout: "padded" },
} satisfies Meta<typeof AccountAdminHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
