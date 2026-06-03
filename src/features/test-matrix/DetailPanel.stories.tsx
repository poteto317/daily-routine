import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DetailPanel } from "./DetailPanel";
import type { DetailTestCase } from "./detailedTestCases";

const meta = {
  title: "Features/TestMatrix/DetailPanel",
  component: DetailPanel,
  parameters: { layout: "fullscreen" },
  args: {
    onClose: fn(),
    onToggleStatus: fn(),
    onUpdateNote: fn(),
  },
} satisfies Meta<typeof DetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const cases: DetailTestCase[] = [
  { id: "c-1", scenario: "正常なメールアドレスとパスワードでログイン", expected: "ホーム画面に遷移する", pc: "ok", sp: "ok", note: "" },
  { id: "c-2", scenario: "間違ったパスワードでログイン", expected: "エラーメッセージが表示される", pc: "ok", sp: "ng", note: "Androidで失敗" },
  { id: "c-3", scenario: "空のメールアドレスでログイン", expected: "バリデーションエラーが表示される", pc: "unchecked", sp: "unchecked", note: "" },
  { id: "c-4", scenario: "ネットワーク切断時のログイン", expected: "ネットワークエラーメッセージが表示される", pc: "na", sp: "na", note: "" },
];

export const Default: Story = {
  args: { itemId: "item-1", itemLabel: "ログイン機能", cases },
};

export const AllOk: Story = {
  args: {
    itemId: "item-2",
    itemLabel: "ログアウト機能",
    cases: cases.map((c) => ({ ...c, pc: "ok" as const, sp: "ok" as const })),
  },
};

/** 「閉じる」ボタンをクリック → onClose が呼ばれる */
export const ClickClose: Story = {
  args: { itemId: "item-1", itemLabel: "ログイン機能", cases },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const closeButton = canvas.getByRole("button", { name: "閉じる" });
    await userEvent.click(closeButton);
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};
