import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { BudgetExpenseItem } from "@/types/routine";
import { BudgetExpenseItemSection } from "./BudgetExpenseItemSection";

const items: BudgetExpenseItem[] = [
  {
    id: "expense-1",
    name: "家賃",
    amount: 80000,
    kind: "fixed",
    createdAt: "2026-05-01T00:00:00+09:00",
  },
  {
    id: "expense-2",
    name: "通信費",
    amount: 8000,
    kind: "fixed",
    createdAt: "2026-05-01T00:00:00+09:00",
  },
];

const meta = {
  title: "Features/Budget/BudgetExpenseItemSection",
  component: BudgetExpenseItemSection,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "固定費",
    items,
    showForm: false,
    listClassName: "space-y-2 mb-4",
    editingItemId: null,
    editingItemName: "",
    editingItemAmount: "",
    onToggleKind: fn(),
    onChangeEditingName: fn(),
    onChangeEditingAmount: fn(),
    onCommitEdit: fn(),
    onCancelEdit: fn(),
    onStartEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof BudgetExpenseItemSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByLabelText("家賃を削除"));
    await expect(args.onDelete).toHaveBeenCalledWith(items[0]);
  },
};

export const Editing: Story = {
  args: {
    editingItemId: "expense-1",
    editingItemName: "家賃",
    editingItemAmount: "80000",
  },
};

export const Empty: Story = {
  args: { items: [] },
};

export const EmptyWithFormOpen: Story = {
  args: { items: [], showForm: true },
};
