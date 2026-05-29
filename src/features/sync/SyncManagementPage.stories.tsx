import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SyncManagementPage } from "./SyncManagementPage";

// SyncManagementPage は useSyncManagementPageState() を内部で呼び出す。
// Storybook 環境では Firestore が未初期化のため getSyncSnapshots() が例外をスローして catch され、
// マウント直後にエラー状態（「同期履歴の取得に失敗しました」）が表示される。

const meta = {
  title: "Features/Sync/SyncManagementPage",
  component: SyncManagementPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SyncManagementPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
