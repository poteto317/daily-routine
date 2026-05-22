import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { WorkTrackerNotesField } from "./WorkTrackerNotesField";

const meta = {
  title: "Features/WorkTracker/WorkTrackerNotesField",
  component: WorkTrackerNotesField,
  parameters: {
    layout: "padded",
  },
  args: {
    setNotes: fn(),
  },
} satisfies Meta<typeof WorkTrackerNotesField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { notes: "" },
};

export const WithNotes: Story = {
  args: {
    notes: "集中できた。認証フローの実装を完了。次はテストを書く予定。",
  },
};

export const LongNotes: Story = {
  args: {
    notes:
      "今日は難しいバグと格闘した。原因はネットワークの非同期処理で、複数のリクエストが競合していた。\n\nfinallyブロックでのクリーンアップが不十分だったのが根本原因。修正後にテストを追加して再発防止した。\n\n明日はコードレビューのフィードバックを反映する。",
  },
};
