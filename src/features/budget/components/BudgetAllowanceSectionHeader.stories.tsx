import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetAllowanceSectionHeader } from "./BudgetAllowanceSectionHeader";

const meta = {
  title: "Features/Budget/BudgetAllowanceSectionHeader",
  component: BudgetAllowanceSectionHeader,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "収入",
    showAddButton: true,
    onAdd: fn(),
  },
} satisfies Meta<typeof BudgetAllowanceSectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: /新しい項目を追加/ }),
    );
    await expect(args.onAdd).toHaveBeenCalledTimes(1);
  },
};

export const WithoutAddButton: Story = {
  args: { showAddButton: false },
};
