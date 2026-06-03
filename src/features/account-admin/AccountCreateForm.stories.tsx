import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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

/** メールアドレス入力 → setCreateEmail が呼ばれる */
export const TypeEmail: Story = {
  args: {
    actionLoading: false,
    createEmail: "",
    createPassword: "",
    createDisplayName: "",
    createIsAdmin: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByPlaceholderText("user@example.com");
    await userEvent.type(emailInput, "newuser@example.com");
    expect(args.setCreateEmail).toHaveBeenCalled();
  },
};

/** 作成ボタンをクリック → onSubmit が呼ばれる */
export const ClickSubmit: Story = {
  args: {
    actionLoading: false,
    createEmail: "newuser@example.com",
    createPassword: "password123",
    createDisplayName: "新規ユーザー",
    createIsAdmin: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole("button", { name: "作成" });
    await userEvent.click(submitButton);
    expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
