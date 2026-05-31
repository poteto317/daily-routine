import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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

/** 「更新」ボタンをクリック → onSubmit が呼ばれる */
export const ClickSubmit: Story = {
  args: {
    actionLoading: false,
    editingAccount: account,
    editDisplayName: "更新名前",
    editIsAdmin: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole("button", { name: "更新" });
    await userEvent.click(submitButton);
    expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

/** 「キャンセル」ボタンをクリック → onCancel が呼ばれる */
export const ClickCancel: Story = {
  args: {
    actionLoading: false,
    editingAccount: account,
    editDisplayName: "一般ユーザー",
    editIsAdmin: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cancelButton = canvas.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton);
    expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
