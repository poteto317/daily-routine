import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SyncManagementPage } from "./SyncManagementPage";

// SyncManagementPage は useSyncManagementPageState() を内部で呼び出す。
// Storybook 環境では Firestore に接続できないため、マウント時のローディング状態が表示される。

const meta = {
  title: "Features/Sync/SyncManagementPage",
  component: SyncManagementPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SyncManagementPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
