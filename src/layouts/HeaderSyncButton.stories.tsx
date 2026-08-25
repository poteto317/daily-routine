import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { HeaderSyncButton } from "./HeaderSyncButton";
import type { SyncStatus } from "@/features/sync";

const meta = {
  title: "Layouts/HeaderSyncButton",
  component: HeaderSyncButton,
  parameters: { layout: "padded" },
  args: { onSyncAction: fn() },
} satisfies Meta<typeof HeaderSyncButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const idleStatus: SyncStatus = {
  isSyncing: false,
  lastSyncTime: new Date("2026-05-21T08:30:00+09:00").getTime(),
  hasRemoteChanges: false,
  hasLocalChanges: false,
  error: null,
};

export const UploadIdle: Story = {
  args: { mode: "upload", syncStatus: idleStatus },
};

export const DownloadIdle: Story = {
  args: { mode: "download", syncStatus: idleStatus },
};

export const UploadWithLocalChanges: Story = {
  args: {
    mode: "upload",
    syncStatus: { ...idleStatus, hasLocalChanges: true },
  },
};

export const DownloadWithRemoteChanges: Story = {
  args: {
    mode: "download",
    syncStatus: { ...idleStatus, hasRemoteChanges: true },
  },
};

export const Syncing: Story = {
  args: {
    mode: "upload",
    syncStatus: { ...idleStatus, isSyncing: true },
  },
};

/** アップロードボタンをクリック → onSyncAction が呼ばれる */
export const ClickUpload: Story = {
  args: { mode: "upload", syncStatus: idleStatus },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "クラウドへアップロード",
    });
    await userEvent.click(button);
    expect(args.onSyncAction).toHaveBeenCalledOnce();
  },
};

/** ダウンロードボタンをクリック → onSyncAction が呼ばれる */
export const ClickDownload: Story = {
  args: { mode: "download", syncStatus: idleStatus },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "クラウドからダウンロード",
    });
    await userEvent.click(button);
    expect(args.onSyncAction).toHaveBeenCalledOnce();
  },
};
