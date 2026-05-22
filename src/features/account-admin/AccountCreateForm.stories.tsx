import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AccountCreateForm } from "./AccountCreateForm";

const meta = {
  title: "Features/AccountAdmin/AccountCreateForm",
  component: AccountCreateForm,
  parameters: { layout: "padded" },
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    setCreateEmail: fn(),
    setCreatePassword: fn(),
    setCreateDisplayName: fn(),
    setCreateIsAdmin: fn(),
  },
} satisfies Meta<typeof AccountCreateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    actionLoading: false,
    createEmail: "",
    createPassword: "",
    createDisplayName: "",
    createIsAdmin: false,
  },
};

export const WithValues: Story = {
  args: {
    actionLoading: false,
    createEmail: "newuser@example.com",
    createPassword: "password123",
    createDisplayName: "新規ユーザー",
    createIsAdmin: false,
  },
};

export const AdminUser: Story = {
  args: {
    actionLoading: false,
    createEmail: "admin@example.com",
    createPassword: "securepass",
    createDisplayName: "管理者",
    createIsAdmin: true,
  },
};

export const Loading: Story = {
  args: {
    actionLoading: true,
    createEmail: "user@example.com",
    createPassword: "password123",
    createDisplayName: "ユーザー",
    createIsAdmin: false,
  },
};
