import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { LoginCredentialForm } from "./LoginCredentialForm";

const meta = {
  title: "Features/Auth/LoginCredentialForm",
  component: LoginCredentialForm,
  parameters: { layout: "padded" },
  args: {
    onSubmit: fn(),
    onEmailChange: fn(),
    onPasswordChange: fn(),
  },
} satisfies Meta<typeof LoginCredentialForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    authUnavailable: false,
    email: "",
    password: "",
    error: null,
    loading: false,
    isSignUp: false,
  },
};

export const WithCredentials: Story = {
  args: {
    authUnavailable: false,
    email: "user@example.com",
    password: "password123",
    error: null,
    loading: false,
    isSignUp: false,
  },
};

export const SignUp: Story = {
  args: {
    authUnavailable: false,
    email: "new@example.com",
    password: "",
    error: null,
    loading: false,
    isSignUp: true,
  },
};

export const WithError: Story = {
  args: {
    authUnavailable: false,
    email: "user@example.com",
    password: "wrong",
    error: "メールアドレスまたはパスワードが正しくありません",
    loading: false,
    isSignUp: false,
  },
};

export const Loading: Story = {
  args: {
    authUnavailable: false,
    email: "user@example.com",
    password: "password123",
    error: null,
    loading: true,
    isSignUp: false,
  },
};

export const AuthUnavailable: Story = {
  args: {
    authUnavailable: true,
    email: "",
    password: "",
    error: null,
    loading: false,
    isSignUp: false,
  },
};

/** メールアドレスを入力 → onEmailChange が呼ばれる */
export const TypeEmail: Story = {
  args: {
    authUnavailable: false,
    email: "",
    password: "",
    error: null,
    loading: false,
    isSignUp: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByPlaceholderText("your@email.com");
    await userEvent.type(emailInput, "user@example.com");
    expect(args.onEmailChange).toHaveBeenCalled();
  },
};

/** ログインボタンをクリック → onSubmit が呼ばれる */
export const ClickSubmit: Story = {
  args: {
    authUnavailable: false,
    email: "user@example.com",
    password: "password123",
    error: null,
    loading: false,
    isSignUp: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole("button", { name: "ログイン" });
    await userEvent.click(submitButton);
    expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
