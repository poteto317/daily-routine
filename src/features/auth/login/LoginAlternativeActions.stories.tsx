import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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

/** 「匿名でログイン」ボタンをクリック → onAnonymousLogin が呼ばれる */
export const ClickAnonymousLogin: Story = {
  args: {
    authUnavailable: false,
    isSignUp: false,
    loading: false,
    onTestLogin: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "匿名でログイン" });
    await userEvent.click(button);
    expect(args.onAnonymousLogin).toHaveBeenCalledOnce();
  },
};

/** モード切り替えボタンをクリック → onToggleMode が呼ばれる */
export const ClickToggleMode: Story = {
  args: {
    authUnavailable: false,
    isSignUp: false,
    loading: false,
    onTestLogin: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "新規アカウントを作成" });
    await userEvent.click(button);
    expect(args.onToggleMode).toHaveBeenCalledOnce();
  },
};
