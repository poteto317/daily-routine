import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CategoryFilter } from "./CategoryFilter";

const meta = {
  title: "Features/Routine/CategoryFilter",
  component: CategoryFilter,
  parameters: { layout: "padded" },
  args: { onFilterChangeAction: fn() },
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: { filterCategory: "all" },
};

export const Health: Story = {
  args: { filterCategory: "health" },
};

export const Study: Story = {
  args: { filterCategory: "study" },
};

export const Work: Story = {
  args: { filterCategory: "work" },
};

/** 「健康」カテゴリをクリック → onFilterChangeAction("health") が呼ばれる */
export const ClickHealthFilter: Story = {
  args: { filterCategory: "all" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const healthButton = canvas.getByRole("button", { name: /健康/ });
    await userEvent.click(healthButton);
    expect(args.onFilterChangeAction).toHaveBeenCalledWith("health");
  },
};

/** 「すべて」をクリック → onFilterChangeAction("all") が呼ばれる */
export const ClickAllFilter: Story = {
  args: { filterCategory: "health" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const allButton = canvas.getByRole("button", { name: "すべて" });
    await userEvent.click(allButton);
    expect(args.onFilterChangeAction).toHaveBeenCalledWith("all");
  },
};
