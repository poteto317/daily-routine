import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CloudSyncSection } from "./CloudSyncSection";
import type { SyncStatus } from "@/features/sync";

const meta = {
  title: "Features/Settings/CloudSyncSection",
  component: CloudSyncSection,
  parameters: {
    layout: "padded",
  },
  args: {
    handleUploadToCloud: fn(),
    handleDownloadFromCloud: fn(),
  },
} satisfies Meta<typeof CloudSyncSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const idleStatus: SyncStatus = {
  isSyncing: false,
  lastSyncTime: null,
  hasRemoteChanges: false,
  hasLocalChanges: false,
  error: null,
};

export const Idle: Story = {
  args: { syncStatus: idleStatus },
};

export const WithLastSync: Story = {
  args: {
    syncStatus: {
      ...idleStatus,
      lastSyncTime: new Date("2026-05-21T08:30:00+09:00").getTime(),
    },
  },
};

export const Syncing: Story = {
  args: {
    syncStatus: {
      ...idleStatus,
      isSyncing: true,
      lastSyncTime: new Date("2026-05-21T08:00:00+09:00").getTime(),
    },
  },
};

export const WithRemoteChanges: Story = {
  args: {
    syncStatus: {
      ...idleStatus,
      hasRemoteChanges: true,
      lastSyncTime: new Date("2026-05-20T22:00:00+09:00").getTime(),
    },
  },
};

export const WithLocalChanges: Story = {
  args: {
    syncStatus: {
      ...idleStatus,
      hasLocalChanges: true,
      lastSyncTime: new Date("2026-05-21T07:45:00+09:00").getTime(),
    },
  },
};

export const WithError: Story = {
  args: {
    syncStatus: {
      ...idleStatus,
      error: "接続に失敗しました。通信環境を確認して再度お試しください。",
    },
  },
};

export const WithAllChanges: Story = {
  args: {
    syncStatus: {
      ...idleStatus,
      hasRemoteChanges: true,
      hasLocalChanges: true,
      lastSyncTime: new Date("2026-05-20T18:00:00+09:00").getTime(),
    },
  },
};

export const ClickUpload: Story = {
  args: { syncStatus: idleStatus },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const uploadButton = canvas.getByRole("button", {
      name: /アップロード/,
    });
    await userEvent.click(uploadButton);
    expect(args.handleUploadToCloud).toHaveBeenCalledOnce();
  },
};

export const ClickDownload: Story = {
  args: { syncStatus: idleStatus },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const downloadButton = canvas.getByRole("button", {
      name: /ダウンロード/,
    });
    await userEvent.click(downloadButton);
    expect(args.handleDownloadFromCloud).toHaveBeenCalledOnce();
  },
};

export const ButtonsDisabledWhileSyncing: Story = {
  args: {
    syncStatus: { ...idleStatus, isSyncing: true },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const uploadButton = canvas.getByRole("button", { name: /アップロード/ });
    const downloadButton = canvas.getByRole("button", { name: /ダウンロード/ });
    expect(uploadButton).toBeDisabled();
    expect(downloadButton).toBeDisabled();
    await userEvent.click(uploadButton);
    await userEvent.click(downloadButton);
    expect(args.handleUploadToCloud).not.toHaveBeenCalled();
    expect(args.handleDownloadFromCloud).not.toHaveBeenCalled();
  },
};
