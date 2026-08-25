import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MatrixCategoryCard } from "./MatrixCategoryCard";
import type { TestCategory } from "./types";
import type { DetailData } from "./matrixComputations";

const meta = {
  title: "Features/TestMatrix/MatrixCategoryCard",
  component: MatrixCategoryCard,
  parameters: { layout: "padded" },
  args: {
    onToggleCollapse: fn(),
    onToggleStatus: fn(),
    onUpdateNote: fn(),
    onOpenDetail: fn(),
  },
} satisfies Meta<typeof MatrixCategoryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const category: TestCategory = {
  id: "cat-1",
  title: "認証機能",
  items: [
    { id: "item-1", label: "ログイン", pc: "ok", sp: "ok", note: "" },
    {
      id: "item-2",
      label: "ログアウト",
      pc: "ok",
      sp: "ng",
      note: "スマホで失敗する",
    },
    {
      id: "item-3",
      label: "パスワードリセット",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
};

const detailData: DetailData = {};

export const Expanded: Story = {
  args: { category, detailData, filterStatus: "all", isCollapsed: false },
};

export const Collapsed: Story = {
  args: { category, detailData, filterStatus: "all", isCollapsed: true },
};

export const FilteredOk: Story = {
  args: { category, detailData, filterStatus: "ok", isCollapsed: false },
};

export const FilteredNg: Story = {
  args: { category, detailData, filterStatus: "ng", isCollapsed: false },
};

/** カテゴリヘッダーをクリック → onToggleCollapse が呼ばれる */
export const ClickCollapseToggle: Story = {
  args: { category, detailData, filterStatus: "all", isCollapsed: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const collapseButton = canvas.getByRole("button", { name: /認証機能/ });
    await userEvent.click(collapseButton);
    expect(args.onToggleCollapse).toHaveBeenCalledWith("cat-1");
  },
};
