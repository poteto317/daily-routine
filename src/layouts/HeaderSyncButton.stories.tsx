import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { HeaderSyncButton } from "./HeaderSyncButton";
import type { SyncStatus } from "@/features/sync/sync/types";

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
  lastSyncTime: Date.now(),
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
