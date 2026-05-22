import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AccountEditForm } from "./AccountEditForm";
import type { Account } from "./types";

const meta = {
  title: "Features/AccountAdmin/AccountEditForm",
  component: AccountEditForm,
  parameters: { layout: "padded" },
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    setEditDisplayName: fn(),
    setEditIsAdmin: fn(),
  },
} satisfies Meta<typeof AccountEditForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const account: Account = {
  uid: "uid-2",
  email: "user@example.com",
  displayName: "一般ユーザー",
  isAdmin: false,
  isAnonymous: false,
  isTestUser: false,
  createdAt: "2026-01-01T00:00:00+09:00",
  updatedAt: "2026-01-01T00:00:00+09:00",
};

export const Default: Story = {
  args: {
    actionLoading: false,
    editingAccount: account,
    editDisplayName: "一般ユーザー",
    editIsAdmin: false,
  },
};

export const EditingSelf: Story = {
  args: {
    actionLoading: false,
    currentUid: "uid-2",
    editingAccount: account,
    editDisplayName: "一般ユーザー",
    editIsAdmin: false,
  },
};

export const Loading: Story = {
  args: {
    actionLoading: true,
    editingAccount: account,
    editDisplayName: "更新中...",
    editIsAdmin: false,
  },
};
