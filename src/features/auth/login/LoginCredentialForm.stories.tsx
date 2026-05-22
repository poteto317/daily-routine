import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
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
