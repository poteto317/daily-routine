import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LoginAlternativeActions } from "./LoginAlternativeActions";

const meta = {
  title: "Features/Auth/LoginAlternativeActions",
  component: LoginAlternativeActions,
  parameters: { layout: "padded" },
  args: {
    onToggleMode: fn(),
    onAnonymousLogin: fn(),
  },
} satisfies Meta<typeof LoginAlternativeActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  args: {
    authUnavailable: false,
    isSignUp: false,
    loading: false,
    onTestLogin: fn(),
  },
};

export const SignUp: Story = {
  args: {
    authUnavailable: false,
    isSignUp: true,
    loading: false,
    onTestLogin: fn(),
  },
};

export const WithoutTestLogin: Story = {
  args: {
    authUnavailable: false,
    isSignUp: false,
    loading: false,
    onTestLogin: null,
  },
};

export const Loading: Story = {
  args: {
    authUnavailable: false,
    isSignUp: false,
    loading: true,
    onTestLogin: fn(),
  },
};
