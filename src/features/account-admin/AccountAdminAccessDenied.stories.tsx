import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccountAdminAccessDenied } from "./AccountAdminAccessDenied";

const meta = {
  title: "Features/AccountAdmin/AccountAdminAccessDenied",
  component: AccountAdminAccessDenied,
  parameters: { layout: "padded" },
} satisfies Meta<typeof AccountAdminAccessDenied>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
