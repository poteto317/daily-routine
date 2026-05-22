import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NotificationTestSection } from "./NotificationTestSection";

const meta = {
  title: "Features/Settings/NotificationTestSection",
  component: NotificationTestSection,
  parameters: {
    layout: "padded",
  },
  args: {
    clearLogs: fn(),
    handleTestNotification: fn(),
  },
} satisfies Meta<typeof NotificationTestSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { notificationStatus: "idle", debugMessage: "", swLogs: [] },
};

export const Testing: Story = {
  args: { notificationStatus: "testing", debugMessage: "", swLogs: [] },
};

export const Success: Story = {
  args: {
    notificationStatus: "success",
    debugMessage: "✅ テスト通知を送信しました",
    swLogs: [],
  },
};

export const Error: Story = {
  args: {
    notificationStatus: "error",
    debugMessage: "❌ 通知の許可が必要です",
    swLogs: [],
  },
};

export const WithSwLogs: Story = {
  args: {
    notificationStatus: "idle",
    debugMessage: "",
    swLogs: [
      "[SW] push event received",
      "[SW] notification shown: テスト通知",
      "[SW] notificationclick: action=open",
    ],
  },
};

export const ClickTest: Story = {
  args: { notificationStatus: "idle", debugMessage: "", swLogs: [] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const testButton = canvas.getByRole("button", { name: /テスト|通知/ });
    await userEvent.click(testButton);
    expect(args.handleTestNotification).toHaveBeenCalledOnce();
  },
};
