import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AccountsTable } from "./AccountsTable";
import type { Account } from "./types";

const meta = {
  title: "Features/AccountAdmin/AccountsTable",
  component: AccountsTable,
  parameters: { layout: "padded" },
  args: {
    onStartEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof AccountsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const accounts: Account[] = [
  {
    uid: "uid-1",
    email: "admin@example.com",
    displayName: "管理者",
    isAdmin: true,
    isAnonymous: false,
    isTestUser: false,
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
  {
    uid: "uid-2",
    email: "user@example.com",
    displayName: "一般ユーザー",
    isAdmin: false,
    isAnonymous: false,
    isTestUser: false,
    createdAt: "2026-02-15T00:00:00+09:00",
    updatedAt: "2026-03-01T00:00:00+09:00",
  },
  {
    uid: "uid-3",
    email: "",
    displayName: "匿名ユーザー",
    isAdmin: false,
    isAnonymous: true,
    isTestUser: false,
    createdAt: "2026-04-10T00:00:00+09:00",
    updatedAt: "2026-04-10T00:00:00+09:00",
  },
  {
    uid: "uid-4",
    email: "test@example.com",
    displayName: "テストユーザー",
    isAdmin: false,
    isAnonymous: false,
    isTestUser: true,
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
];

export const WithAccounts: Story = {
  args: {
    accounts,
    actionLoading: false,
    currentUid: "uid-1",
  },
};

export const Empty: Story = {
  args: {
    accounts: [],
    actionLoading: false,
  },
};

export const ActionLoading: Story = {
  args: {
    accounts,
    actionLoading: true,
    currentUid: "uid-1",
  },
};
