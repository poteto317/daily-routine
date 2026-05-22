import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AccountAdminToolbar } from "./AccountAdminToolbar";

const meta = {
  title: "Features/AccountAdmin/AccountAdminToolbar",
  component: AccountAdminToolbar,
  parameters: { layout: "padded" },
  args: {
    onToggleCreateForm: fn(),
    onRefresh: fn(),
  },
} satisfies Meta<typeof AccountAdminToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
