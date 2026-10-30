import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { DetailPanelHeader } from "./DetailPanelHeader";

const meta = {
  title: "Features/TestMatrix/DetailPanelHeader",
  component: DetailPanelHeader,
  parameters: { layout: "padded" },
  args: {
    itemId: "item-1",
    itemLabel: "ログイン機能",
    titleId: "detail-panel-header-story-title",
    cases: [
      {
        id: "c-1",
        scenario: "正常系",
        expected: "ホーム画面に遷移する",
        pc: "ok",
        sp: "ok",
        note: "",
      },
      {
        id: "c-2",
        scenario: "異常系",
        expected: "エラーが表示される",
        pc: "ok",
        sp: "ng",
        note: "",
      },
      {
        id: "c-3",
        scenario: "未実施",
        expected: "バリデーションエラーが表示される",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
    ],
    onClose: fn(),
  },
} satisfies Meta<typeof DetailPanelHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
